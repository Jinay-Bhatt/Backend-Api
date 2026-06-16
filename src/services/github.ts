import { Octokit } from "@octokit/rest";

/**
 * Pushes a compiled codebase file tree directly to a GitHub repository using the Git database REST API.
 * Uses standard Tree/Commit/Ref update mechanics.
 */
export async function pushToGithub(
  accessToken: string,
  repositoryName: string,
  fileTree: Record<string, string>,
  branch = "main"
): Promise<string> {
  const [owner, repo] = repositoryName.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid repository format: ${repositoryName}`);
  }

  // Initialize Octokit client with user credential token
  const octokit = new Octokit({ auth: accessToken });

  // 1. Fetch reference for the target branch
  const { data: refData } = await octokit.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`,
  });
  const lastCommitSha = refData.object.sha;

  // 2. Fetch the commit details to retrieve the base tree SHA
  const { data: commitData } = await octokit.git.getCommit({
    owner,
    repo,
    commit_sha: lastCommitSha,
  });
  const baseTreeSha = commitData.tree.sha;

  // 3. Construct tree nodes
  const treeNodes = Object.entries(fileTree).map(([path, content]) => ({
    path,
    mode: "100644" as const, // 100644 indicates standard file
    type: "blob" as const,
    content,
  }));

  // 4. Create new Git Tree
  const { data: treeData } = await octokit.git.createTree({
    owner,
    repo,
    tree: treeNodes,
    base_tree: baseTreeSha,
  });

  // 5. Create a new Commit
  const { data: newCommitData } = await octokit.git.createCommit({
    owner,
    repo,
    message: "🚀 Deploy compiled FlowForge visual backend updates",
    tree: treeData.sha,
    parents: [lastCommitSha],
  });

  // 6. Update reference pointer on remote branch
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitData.sha,
  });

  return newCommitData.sha;
}
