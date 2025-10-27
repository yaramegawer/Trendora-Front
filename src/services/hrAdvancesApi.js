import api from '../api/axios';
import { API_CONFIG } from '../config/api';

const hrAdvancesApi = {
  // GET /hr/advances (list)
  getAdvances: async (page = 1, limit = 10, options = {}) => {
    const params = { page, limit };
    if (options && options.status && options.status !== 'all') {
      params.status = String(options.status).toLowerCase();
    }
    const res = await api.get(`${API_CONFIG.ENDPOINTS.HR.ADVANCES_LIST}`, { params });
    if (res?.data?.success === false) {
      throw new Error(res.data?.message || 'Failed to fetch advances');
    }
    return res.data;
  },

  // PUT /hr/Advance/:id (update status)
  updateStatus: async (id, status) => {
    const res = await api.put(`${API_CONFIG.ENDPOINTS.HR.ADVANCES}/${id}`, { status });
    if (res?.data?.success === false) {
      throw new Error(res.data?.message || 'Failed to update advance status');
    }
    return res.data;
  },

  // DELETE /hr/Advance/:id
  deleteAdvance: async (id) => {
    const res = await api.delete(`${API_CONFIG.ENDPOINTS.HR.ADVANCES}/${id}`);
    if (res?.data?.success === false) {
      throw new Error(res.data?.message || 'Failed to delete advance');
    }
    return res.data;
  },
};

export default hrAdvancesApi;
