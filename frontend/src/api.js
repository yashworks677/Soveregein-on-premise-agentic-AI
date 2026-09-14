const API_BASE_URL = "/api";

// Get token from localStorage
export const getToken = () => localStorage.getItem("sovereign_token");
export const setToken = (token) => localStorage.setItem("sovereign_token", token);
export const removeToken = () => localStorage.removeItem("sovereign_token");

export const getUser = () => {
  const user = localStorage.getItem("sovereign_user");
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => localStorage.setItem("sovereign_user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("sovereign_user");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Authentication failed" }));
      throw new Error(err.detail || "Authentication failed");
    }
    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to verify credentials");
    return res.json();
  },

  async getSampleCases() {
    const res = await fetch(`${API_BASE_URL}/workbench/sample-cases`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to load sample test cases");
    return res.json();
  },

  async runWorkbenchTask(requirement, files = [], sampleCaseId = null) {
    const formData = new FormData();
    formData.append("requirement", requirement);
    if (sampleCaseId) {
      formData.append("sample_case_id", sampleCaseId);
    }
    for (const f of files) {
      formData.append("files", f);
    }

    const res = await fetch(`${API_BASE_URL}/workbench/run`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Task execution failed" }));
      throw new Error(err.detail || "Task execution failed");
    }
    return res.json();
  },

  async getKnowledgeDocs() {
    const res = await fetch(`${API_BASE_URL}/knowledge`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to load knowledge base");
    return res.json();
  },

  async uploadKnowledgeDoc(title, description, file) {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/knowledge/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },

  async deleteKnowledgeDoc(docId) {
    const res = await fetch(`${API_BASE_URL}/knowledge/${docId}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to delete document");
    return res.json();
  },

  async searchKnowledge(query) {
    const formData = new FormData();
    formData.append("query", query);

    const res = await fetch(`${API_BASE_URL}/knowledge/search`, {
      method: "POST",
      headers: authHeaders(),
      body: formData
    });
    if (!res.ok) throw new Error("Search query failed");
    return res.json();
  },

  async getTasks() {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch task history");
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE_URL}/audit`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE_URL}/system/status`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error("Failed to fetch system status");
    return res.json();
  },

  getDownloadUrl(filename) {
    return `${API_BASE_URL}/download/${filename}`;
  }
};
