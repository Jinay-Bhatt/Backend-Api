import { Worker } from "bullmq";
import * as _archiver from "archiver";
const archiver = _archiver.default || _archiver;
import fs from "node:fs";
import path from "node:path";
import { config } from "../config/index.js";
import { prisma } from "../services/db.js";
import { compileProject } from "../services/compiler.js";
import { pushToGithub } from "../services/github.js";
import { decrypt } from "../services/crypto.js";
let workerInstance = null;
export function startWorker() {
    if (workerInstance)
        return workerInstance;
    workerInstance = new Worker("export-jobs", async (job) => {
        const { projectId, userId, pushToGit } = job.data;
        console.log(`📦 Starting compilation job for project ${projectId}`);
        // 1. Retrieve project and workflows
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { workflows: true },
        });
        if (!project) {
            throw new Error(`Project ${projectId} not found`);
        }
        // 2. Run graph compiler
        const fileTree = compileProject(project.name, project.workflows);
        // 3. Zip files in-memory and write to local exports directory
        const exportsDir = path.resolve("exports");
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }
        const zipPath = path.join(exportsDir, `${projectId}.zip`);
        const outputStream = fs.createWriteStream(zipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        await new Promise((resolve, reject) => {
            outputStream.on("close", () => resolve());
            archive.on("error", (err) => reject(err));
            archive.pipe(outputStream);
            // Append files from tree
            for (const [filePath, content] of Object.entries(fileTree)) {
                archive.append(content, { name: filePath });
            }
            archive.finalize();
        });
        console.log(`✅ Project archived successfully to: ${zipPath}`);
        // 4. Push to remote Git repository if requested
        if (pushToGit) {
            const gitConfig = await prisma.gitConfiguration.findFirst({
                where: { userId, isActive: true },
            });
            if (!gitConfig) {
                throw new Error("Git push requested but no active Git Configuration found");
            }
            console.log(`🐙 Pushing codebase to repository ${gitConfig.repositoryName}`);
            // Decrypt credential token
            const decryptedToken = decrypt(gitConfig.accessToken);
            // Commit and push
            const commitSha = await pushToGithub(decryptedToken, gitConfig.repositoryName, fileTree);
            console.log(`✅ Pushed successfully. Commit SHA: ${commitSha}`);
            return { zipPath, commitSha };
        }
        return { zipPath };
    }, {
        connection: {
            url: config.redisUrl,
        },
    });
    workerInstance.on("completed", (job) => {
        console.log(`🎉 Job ${job.id} completed successfully`);
    });
    workerInstance.on("failed", (job, err) => {
        console.error(`❌ Job ${job?.id} failed: ${err.message}`);
    });
    workerInstance.on("error", (err) => {
        console.error(`❌ BullMQ worker connection error: ${err.message}`);
    });
    return workerInstance;
}
