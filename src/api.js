const headers = (token) =>
  token
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : { 'Content-Type': 'application/json' };

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function handle(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.error || res.statusText);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

export const api = {
  async registerUser(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async login(payload) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async listClients(token) {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async createClient(payload, token) {
    const res = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async createContract(payload, token) {
    const res = await fetch(`${API_BASE}/contracts`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async myContracts(token) {
    const res = await fetch(`${API_BASE}/contracts/me`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async dashboardSummary(token, clienteId) {
    const search = clienteId ? `?clienteId=${clienteId}` : '';
    const res = await fetch(`${API_BASE}/contracts/summary${search}`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async adminContracts(token, filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/admin/contracts${query}`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async adminCreateContract(payload, token) {
    const res = await fetch(`${API_BASE}/admin/contracts`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminUpdateContract(id, payload, token) {
    const res = await fetch(`${API_BASE}/admin/contracts/${id}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminDeleteContract(id, token) {
    const res = await fetch(`${API_BASE}/admin/contracts/${id}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handle(res);
  },

  async adminClients(token) {
    const res = await fetch(`${API_BASE}/admin/clients`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async adminCreateClient(payload, token) {
    const res = await fetch(`${API_BASE}/admin/clients`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminUpdateClient(id, payload, token) {
    const res = await fetch(`${API_BASE}/admin/clients/${id}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminLinkClient(payload, token) {
    const res = await fetch(`${API_BASE}/admin/clients/link`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminUsers(token) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: headers(token),
    });
    return handle(res);
  },

  async adminLinkClientsToUser(payload, token) {
    const res = await fetch(`${API_BASE}/admin/clients/link/bulk`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminUpdateUser(id, payload, token) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'PATCH',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminDeleteUser(id, token) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handle(res);
  },

  async adminShareToken(payload, token) {
    const res = await fetch(`${API_BASE}/admin/clients/share-token`, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify(payload),
    });
    return handle(res);
  },

  async adminDeleteClient(id, token) {
    const res = await fetch(`${API_BASE}/admin/clients/${id}`, {
      method: 'DELETE',
      headers: headers(token),
    });
    return handle(res);
  },

  async publicDashboard(token) {
    const res = await fetch(`${API_BASE}/public/dashboard?token=${encodeURIComponent(token)}`, {
      headers: headers(),
    });
    return handle(res);
  },
};
