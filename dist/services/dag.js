/**
 * Topological Sort using Kahn's Algorithm.
 * Arranges nodes sequentially based on Directed Acyclic Graph (DAG) edges.
 * Throws an error if circular references are detected.
 */
export function orderNodes(nodes, edges) {
    const ordered = [];
    // Build adjacency list and in-degree counter
    const adj = {};
    const inDegree = {};
    for (const node of nodes) {
        adj[node.id] = [];
        inDegree[node.id] = 0;
    }
    for (const edge of edges) {
        // Check if source and target are defined in nodes
        if (adj[edge.source] !== undefined && adj[edge.target] !== undefined) {
            adj[edge.source].push(edge.target);
            inDegree[edge.target]++;
        }
    }
    // Find all start nodes (in-degree = 0)
    const queue = [];
    for (const node of nodes) {
        if (inDegree[node.id] === 0) {
            queue.push(node.id);
        }
    }
    // BFS Queue traversal
    while (queue.length > 0) {
        const nodeId = queue.shift();
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
            ordered.push(node);
        }
        for (const neighbor of adj[nodeId] || []) {
            inDegree[neighbor]--;
            if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
            }
        }
    }
    // If ordered nodes length is less than original nodes length, a loop/cycle exists
    if (ordered.length < nodes.length) {
        throw new Error("Circular dependency detected: The visual graph contains routing loops.");
    }
    return ordered;
}
/**
 * Safely extracts nested properties from a given object context using a dotted string path.
 * Example: resolveVariable("request.body.user.name", context)
 */
export function resolveVariable(path, context) {
    if (!path)
        return undefined;
    const parts = path.split(".");
    let current = context;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return undefined;
        }
        current = current[part];
    }
    return current;
}
/**
 * Parses a raw SQL query containing contextual variables prefixed with '$'
 * and converts them into standard PostgreSQL prepared statement parameters ($1, $2, etc.).
 *
 * Example:
 * Query: "SELECT * FROM users WHERE age > $request.query.minAge AND email = $request.body.email"
 * Output: {
 *   sql: "SELECT * FROM users WHERE age > $1 AND email = $2",
 *   values: [minAgeValue, emailValue]
 * }
 */
export function parameterizeSqlQuery(query, context) {
    // Matches any $ variable structure like: $request.body.name or $steps.nodeId.output
    const variableRegex = /\$([a-zA-Z0-9_\.]+)/g;
    const values = [];
    let index = 1;
    const sql = query.replace(variableRegex, (match, path) => {
        const val = resolveVariable(path, context);
        values.push(val !== undefined ? val : null);
        return `$${index++}`;
    });
    return { sql, values };
}
