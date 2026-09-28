const API_BASE = '/api/v1';

export const apiClient = {
  token: null,

  setToken(t) {
    this.token = t;
    if (t) localStorage.setItem('ekikrit_jwt', t);
    else localStorage.removeItem('ekikrit_jwt');
  },

  getToken() {
    if (!this.token) this.token = localStorage.getItem('ekikrit_jwt');
    return this.token;
  },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP error ${res.status}`);
    }
    return data;
  },

  // Auth
  getPersonas: () => apiClient.request('/auth/personas'),
  requestOtp: (identifier) => apiClient.request('/auth/request-otp', { method: 'POST', body: JSON.stringify({ identifier }) }),
  verifyOtp: (identifier, otp) => apiClient.request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ identifier, otp }) }),
  quickLogin: (personaId) => apiClient.request('/auth/quick-login', { method: 'POST', body: JSON.stringify({ personaId }) }),

  // Citizen
  getCitizenRecords: (unifiedId) => apiClient.request(`/citizen/${unifiedId}/records`),
  getCitizenApplications: (unifiedId) => apiClient.request(`/citizen/${unifiedId}/applications`),
  getCitizenConsents: (unifiedId) => apiClient.request(`/citizen/${unifiedId}/consents`),
  approveConsent: (consentId) => apiClient.request(`/citizen/consent/${consentId}/approve`, { method: 'POST' }),
  denyConsent: (consentId) => apiClient.request(`/citizen/consent/${consentId}/deny`, { method: 'POST' }),
  revokeConsent: (consentId) => apiClient.request(`/citizen/consent/${consentId}/revoke`, { method: 'POST' }),

  // Official
  getBeneficiaries: () => apiClient.request('/official/beneficiaries'),
  requestConsent: (body) => apiClient.request('/official/consent/request', { method: 'POST', body: JSON.stringify(body) }),
  getHitlQueue: () => apiClient.request('/official/hitl-queue'),
  resolveHitl: (body) => apiClient.request('/official/hitl-resolve', { method: 'POST', body: JSON.stringify(body) }),
  simulateEntityMatch: (profileA, profileB) => apiClient.request('/official/entity-match-simulate', { method: 'POST', body: JSON.stringify({ profileA, profileB }) }),

  // Admin
  getAdapters: () => apiClient.request('/admin/adapters'),
  toggleDowntime: (id) => apiClient.request(`/admin/adapter/${id}/toggle-downtime`, { method: 'POST' }),
  onboardLiveAdapter: (config) => apiClient.request('/admin/adapter/onboard-live', { method: 'POST', body: JSON.stringify(config) }),
  suggestAiMapping: (samplePayload, departmentMetadata) => apiClient.request('/admin/ai/suggest-mapping', { method: 'POST', body: JSON.stringify({ samplePayload, departmentMetadata }) }),
  getAuditLogs: () => apiClient.request('/admin/audit-logs'),

  // Goal-Based Bundles
  getBundles: () => apiClient.request('/bundles'),
  getBundleSchema: (id, unifiedId) => apiClient.request(`/bundles/${id}?unifiedId=${unifiedId || ''}`),
  submitBundle: (id, body) => apiClient.request(`/bundles/${id}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  getCitizenBundleApplications: (unifiedId) => apiClient.request(`/bundles/applications/${unifiedId}`),
  registerAdminBundle: (body) => apiClient.request('/admin/bundles', { method: 'POST', body: JSON.stringify(body) }),

  // Mobile / Network Info
  getNetworkInfo: () => apiClient.request('/network-info')
};