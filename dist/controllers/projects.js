import { prisma } from "../services/db.js";
export async function createProject(request, reply) {
    const { name, description } = request.body;
    const user = request.user;
    if (!name) {
        return reply.status(400).send({
            error: "Bad Request: project name is required",
        });
    }
    try {
        const project = await prisma.project.create({
            data: {
                name,
                description,
                ownerId: user.id,
            },
        });
        return reply.status(201).send(project);
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
export async function listProjects(request, reply) {
    const user = request.user;
    try {
        const projects = await prisma.project.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: "desc" },
        });
        return reply.send(projects);
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
export async function getProject(request, reply) {
    const { id } = request.params;
    const user = request.user;
    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                ownerId: user.id,
            },
            include: {
                workflows: true,
            },
        });
        if (!project) {
            return reply.status(404).send({
                error: "Not Found: Project not found or unauthorized",
            });
        }
        return reply.send(project);
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
export async function updateProject(request, reply) {
    const { id } = request.params;
    const { name, description } = request.body;
    const user = request.user;
    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                ownerId: user.id,
            },
        });
        if (!project) {
            return reply.status(404).send({
                error: "Not Found: Project not found or unauthorized",
            });
        }
        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name: name ?? project.name,
                description: description ?? project.description,
            },
        });
        return reply.send(updatedProject);
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
export async function deleteProject(request, reply) {
    const { id } = request.params;
    const user = request.user;
    try {
        const project = await prisma.project.findFirst({
            where: {
                id,
                ownerId: user.id,
            },
        });
        if (!project) {
            return reply.status(404).send({
                error: "Not Found: Project not found or unauthorized",
            });
        }
        await prisma.project.delete({
            where: { id },
        });
        return reply.send({
            message: "Project and associated workflows deleted successfully",
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({
            error: "Internal Server Error",
            details: error.message,
        });
    }
}
