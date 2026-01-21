import api from './api';

const labService = {
    // Test Catalog
    getTests: async (params) => {
        const response = await api.get('/lab/tests', { params });
        return response.data;
    },

    createTest: async (data) => {
        const response = await api.post('/lab/tests', data);
        return response.data;
    },

    // Lab Requests
    getRequests: async (params) => {
        const response = await api.get('/lab/requests', { params });
        return response.data;
    },

    createRequest: async (data) => {
        const response = await api.post('/lab/requests', data);
        return response.data;
    },

    // Sample Collection
    collectSample: async (requestId, data) => {
        const response = await api.post(`/lab/requests/${requestId}/sample`, data);
        return response.data;
    },

    // Results
    enterResult: async (requestId, data) => {
        const response = await api.post(`/lab/requests/${requestId}/results`, data);
        return response.data;
    },

    verifyResult: async (requestId) => {
        const response = await api.put(`/lab/requests/${requestId}/verify`);
        return response.data;
    }
};

export default labService;
