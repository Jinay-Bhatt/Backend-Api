import { prisma } from "../services/db.js";
import { runInSandbox } from "../services/sandbox.js";
import { orderNodes, resolveVariable, parameterizeSqlQuery, } from "../services/dag.js";
// In-memory rate limiting store (key: IP + workflowId)
const rateLimitStore = new Map();
/**
 * Checks and enforces rate limits for incoming gateway requests.
 */
function checkRateLimit(ip, workflowId, limit, windowSecs) {
    const now = Date.now();
    const key = `${ip}:${workflowId}`;
    const record = rateLimitStore.get(key);
    if (!record || now > record.resetTime) {
        rateLimitStore.set(key, {
            count: 1,
            resetTime: now + windowSecs * 1000,
        });
        return true;
    }
    if (record.count >= limit) {
        return false;
    }
    record.count++;
    return true;
}
/**
 * Helper to match a client's request path against a workflow pattern (supporting parameterized routes like :id).
 */
function matchPath(pattern, requestPath) {
    const routeParts = pattern.split("/").filter(Boolean);
    const reqParts = requestPath.split("/").filter(Boolean);
    if (routeParts.length !== reqParts.length)
        return null;
    const params = {};
    for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
            const paramName = routeParts[i].slice(1);
            params[paramName] = reqParts[i];
        }
        else if (routeParts[i] !== reqParts[i]) {
            return null;
        }
    }
    return params;
}
export async function gatewayRoutes(fastify) {
    // wildcard catcher matching any dynamic route under the /api/:projectId namespace
    fastify.all("/api/:projectId/*", async (request, reply) => {
        const { projectId } = request.params;
        const wildPath = `/${request.params["*"]}`;
        const method = request.method;
        const startTime = Date.now();
        let matchedWorkflow = null;
        let matchedParams = {};
        try {
            // Fetch all published workflows for the project and method
            const workflows = await prisma.workflow.findMany({
                where: {
                    projectId,
                    method,
                    isPublished: true,
                },
                include: {
                    gatewayConfig: true,
                },
            });
            // Resolve path match
            for (const w of workflows) {
                const params = matchPath(w.path, wildPath);
                if (params !== null) {
                    matchedWorkflow = w;
                    matchedParams = params;
                    break;
                }
            }
            if (!matchedWorkflow) {
                return reply.status(404).send({
                    error: `Not Found: Route '${method} ${wildPath}' not found or not published`,
                });
            }
            const workflow = matchedWorkflow;
            // 1. Enforce JWT Security Hook
            if (workflow.gatewayConfig?.requireJwt) {
                try {
                    await request.jwtVerify();
                }
                catch (jwtErr) {
                    return reply.status(401).send({
                        error: "Unauthorized: Access requires a valid JWT Bearer token",
                    });
                }
            }
            // 2. Enforce Rate Limiting Hook
            if (workflow.gatewayConfig?.rateLimitLimit &&
                workflow.gatewayConfig?.rateLimitWindow) {
                const clientIp = request.ip || "unknown-ip";
                const underLimit = checkRateLimit(clientIp, workflow.id, workflow.gatewayConfig.rateLimitLimit, workflow.gatewayConfig.rateLimitWindow);
                if (!underLimit) {
                    return reply.status(429).send({
                        error: "Too Many Requests: Rate limit exceeded",
                    });
                }
            }
            // 3. Establish Execution Context
            const executionContext = {
                request: {
                    body: request.body,
                    query: request.query,
                    params: matchedParams,
                    headers: request.headers,
                },
                steps: {},
            };
            // 4. Trace and Sort Graph Nodes
            const nodes = workflow.nodes || [];
            const edges = workflow.edges || [];
            const orderedNodes = orderNodes(nodes, edges);
            // 5. Sequential execution loop
            for (const node of orderedNodes) {
                // A. Trigger Nodes (No-op at runtime execution, just registers start)
                if (node.type === "triggerNode" ||
                    node.type === "httpTrigger" ||
                    node.type === "trigger") {
                    executionContext.steps[node.id] = { status: "triggered" };
                    continue;
                }
                // B. Database Query Nodes (PostgreSQL SQL execution)
                if (node.type === "databaseNode" || node.type === "database") {
                    const queryTemplate = node.data?.query;
                    if (!queryTemplate) {
                        throw new Error(`Database node '${node.id}' missing SQL query query`);
                    }
                    const { sql, values } = parameterizeSqlQuery(queryTemplate, executionContext);
                    // Execute raw SQL on Postgres using prepared variables
                    const dbResult = await prisma.$queryRawUnsafe(sql, ...values);
                    executionContext.steps[node.id] = dbResult;
                    continue;
                }
                // C. Custom Code Script Nodes (vm sandbox execution)
                if (node.type === "customCodeNode" || node.type === "code") {
                    const scriptCode = node.data?.code;
                    if (!scriptCode) {
                        throw new Error(`Code node '${node.id}' missing JavaScript script`);
                    }
                    const runResult = runInSandbox(scriptCode, executionContext);
                    if (!runResult.success) {
                        throw new Error(`Script Error in node '${node.id}': ${runResult.error}`);
                    }
                    executionContext.steps[node.id] = runResult.data;
                    continue;
                }
                // D. Response Node (Stops execution loop and replies)
                if (node.type === "responseNode" || node.type === "response") {
                    const status = node.data?.statusCode || 200;
                    let responseBody = node.data?.body;
                    // Resolve references if body points to context variable, e.g. "$steps.nodeId"
                    if (typeof responseBody === "string" &&
                        responseBody.startsWith("$")) {
                        responseBody = resolveVariable(responseBody.slice(1), executionContext);
                    }
                    const latency = Date.now() - startTime;
                    // Log successful execution audit trail
                    await prisma.executionLog.create({
                        data: {
                            workflowId: workflow.id,
                            method,
                            path: wildPath,
                            responseStatus: status,
                            latencyMs: latency,
                            requestPayload: JSON.stringify({
                                query: request.query,
                                body: request.body || {},
                            }),
                        },
                    });
                    // Stream metrics via WebSockets in real-time
                    if (fastify.io) {
                        fastify.io.to(projectId).emit("metrics", {
                            workflowId: workflow.id,
                            method,
                            path: wildPath,
                            responseStatus: status,
                            latencyMs: latency,
                            timestamp: new Date().toISOString(),
                        });
                    }
                    return reply.status(status).send(responseBody);
                }
            }
            // Fallback response if workflow completes without responseNode
            const executionTime = Date.now() - startTime;
            // Stream fallback metrics via WebSockets
            if (fastify.io) {
                fastify.io.to(projectId).emit("metrics", {
                    workflowId: workflow.id,
                    method,
                    path: wildPath,
                    responseStatus: 200,
                    latencyMs: executionTime,
                    timestamp: new Date().toISOString(),
                });
            }
            return reply.status(200).send({
                message: "Workflow executed successfully",
                latencyMs: executionTime,
            });
        }
        catch (err) {
            const latency = Date.now() - startTime;
            request.log.error(err);
            // Audit log database failure
            try {
                if (matchedWorkflow) {
                    await prisma.executionLog.create({
                        data: {
                            workflowId: matchedWorkflow.id,
                            method,
                            path: wildPath,
                            responseStatus: 500,
                            latencyMs: latency,
                            errorDetails: err.message || "Unknown error during execution",
                            requestPayload: JSON.stringify({
                                query: request.query,
                                body: request.body || {},
                            }),
                        },
                    });
                }
            }
            catch (logErr) {
                request.log.error(logErr, "Failed to write error execution log to DB");
            }
            // Stream error metrics via WebSockets in real-time
            if (fastify.io && matchedWorkflow) {
                fastify.io.to(projectId).emit("metrics", {
                    workflowId: matchedWorkflow.id,
                    method,
                    path: wildPath,
                    responseStatus: 500,
                    latencyMs: latency,
                    error: err.message || "Execution error",
                    timestamp: new Date().toISOString(),
                });
            }
            return reply.status(500).send({
                error: "Workflow execution aborted",
                message: err.message,
            });
        }
    });
}
