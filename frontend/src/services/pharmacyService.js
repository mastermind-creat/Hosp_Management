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
    }
};

export default pharmacyService;
