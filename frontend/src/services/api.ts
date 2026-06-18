const BASE_URL = "http://localhost:5000/api";

/**
 * Returns request headers, appending the JWT token if present in localStorage.
 */
function getHeaders(): Record<string, string> {
  if (typeof window === "undefined") {
    return { "Content-Type": "application/json" };
  }
  const token = localStorage.getItem("flowforge_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Global fetch wrapper handling credentials injection and standardized error responses.
 */
async function request(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${BASE_URL}${path}`;
  const headers = { ...getHeaders(), ...options.headers };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status: ${response.status}`);
  }

  // Handle JSON response bodies
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response;
}

export const api = {
  auth: {
    register: (body: any) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    login: (body: any) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  },
  projects: {
    list: () => request("/projects"),
    create: (body: { name: string; description?: string }) =>
      request("/projects", { method: "POST", body: JSON.stringify(body) }),
    get: (id: string) => request(`/projects/${id}`),
    update: (id: string, body: { name?: string; description?: string }) =>
      request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/projects/${id}`, { method: "DELETE" }),
  },
  workflows: {
    list: (projectId: string) => request(`/projects/${projectId}/workflows`),
    create: (projectId: string, body: { name: string; path: string; method: string }) =>
      request(`/projects/${projectId}/workflows`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    get: (id: string) => request(`/workflows/${id}`),
    update: (
      id: string,
      body: {
        name?: string;
        path?: string;
        method?: string;
        nodes?: any[];
        edges?: any[];
        isPublished?: boolean;
      }
    ) => request(`/workflows/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/workflows/${id}`, { method: "DELETE" }),
    publish: (id: string, isPublished: boolean) =>
      request(`/workflows/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ isPublished }),
      }),
    createVersion: (id: string, changelog: string) =>
      request(`/workflows/${id}/version`, {
        method: "POST",
        body: JSON.stringify({ changelog }),
      }),
  },
  exporter: {
    exportProject: (projectId: string, pushToGit: boolean) =>
      request(`/projects/${projectId}/export`, {
        method: "POST",
        body: JSON.stringify({ pushToGit }),
      }),
    getJobStatus: (projectId: string, jobId: string) =>
      request(`/projects/${projectId}/export/status/${jobId}`),
    getDownloadUrl: (projectId: string) =>
      `${BASE_URL}/projects/${projectId}/export/download`,
  },
};
export { BASE_URL };
