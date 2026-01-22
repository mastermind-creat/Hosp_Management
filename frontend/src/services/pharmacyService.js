import api from './api';

const pharmacyService = {
    // Drug Management
    getDrugs: async (params) => {
        const response = await api.get('/drugs', { params });
        return response.data;
    },

    createDrug: async (data) => {
        const response = await api.post('/drugs', data);
        return response.data;
    },

    getDrugDetails: async (id) => {
        const response = await api.get(`/drugs/${id}`);
        return response.data;
    },

    updateDrug: async (id, data) => {
        const response = await api.put(`/drugs/${id}`, data);
        return response.data;
    },

    deleteDrug: async (id) => {
        const response = await api.delete(`/drugs/${id}`);
        return response.data;
    },

    // Stock Management
    addStock: async (drugId, data) => {
        const response = await api.post(`/drugs/${drugId}/stock`, data);
        return response.data;
    },

    getAlerts: async () => {
        const response = await api.get('/pharmacy/alerts');
        return response.data;
    },

    // Dispensing
    dispenseDrug: async (data) => {
        const response = await api.post('/pharmacy/dispense', data);
        return response.data;
    },

    // Suppliers
    getSuppliers: async () => {
        const response = await api.get('/pharmacy/suppliers');
        return response.data;
    },

    createSupplier: async (data) => {
        const response = await api.post('/pharmacy/suppliers', data);
        return response.data;
    },

    updateSupplier: async (id, data) => {
        const response = await api.put(`/pharmacy/suppliers/${id}`, data);
        return response.data;
    },

    deleteSupplier: async (id) => {
        const response = await api.delete(`/pharmacy/suppliers/${id}`);
        return response.data;
    }
};

export default pharmacyService;
