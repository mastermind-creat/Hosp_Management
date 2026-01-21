import api from './api';

const billingService = {
    // Invoices
    getInvoices: async (params) => {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    getInvoiceById: async (id) => {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    createInvoice: async (data) => {
        const response = await api.post('/invoices', data);
        return response.data;
    },

    voidInvoice: async (id, reason) => {
        const response = await api.put(`/invoices/${id}/void`, { reason });
        return response.data;
    },

    // Payments
    recordPayment: async (data) => {
        const response = await api.post('/payments', data);
        return response.data;
    },

    // Reports
    getDailySummary: async (date) => {
        const response = await api.get('/reports/daily-summary', { params: { date } });
        return response.data;
    },

    generateZReport: async (date) => {
        const response = await api.post('/reports/z-report', { date });
        return response.data;
    },

    exportInvoice: async (id) => {
        const response = await api.get(`/invoices/${id}/export`, { responseType: 'blob' });
        return response.data;
    },

    // Catalog for Invoice Items
    getDrugs: async (search) => {
        const response = await api.get('/drugs', { params: { search, limit: 10 } });
        return response.data;
    },

    getLabTests: async (search) => {
        const response = await api.get('/lab/tests', { params: { search, limit: 20 } });
        return response.data;
    }
};

export default billingService;
