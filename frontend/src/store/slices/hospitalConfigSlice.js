import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchHospitalConfig = createAsyncThunk(
    'hospitalConfig/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/hospital-config')
            return response.data.config
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch config')
        }
    }
)

export const updateHospitalConfig = createAsyncThunk(
    'hospitalConfig/update',
    async (configData, { rejectWithValue }) => {
        try {
            const response = await api.put('/hospital-config', configData)
            return response.data.config
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to update config')
        }
    }
)

export const toggleDepartment = createAsyncThunk(
    'hospitalConfig/toggleDepartment',
    async ({ department, enabled }, { rejectWithValue }) => {
        try {
            const response = await api.post('/hospital-config/toggle-department', {
                department,
                enabled
            })
            return response.data.enabled_departments
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to toggle department')
        }
    }
)

const initialState = {
    config: null,
    hospitalMode: 'FULL',
    allowMultiRoleUsers: true,
    requireRoleSwitching: true,
    billingInterruptEnabled: true,
    enabledDepartments: ['lab', 'pharmacy', 'ward', 'radiology'],
    complianceRules: {},
    loading: false,
    error: null,
}

const hospitalConfigSlice = createSlice({
    name: 'hospitalConfig',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setHospitalMode: (state, action) => {
            state.hospitalMode = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch config
            .addCase(fetchHospitalConfig.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchHospitalConfig.fulfilled, (state, action) => {
                state.loading = false
                state.config = action.payload
                state.hospitalMode = action.payload.hospital_mode
                state.allowMultiRoleUsers = action.payload.allow_multi_role_users
                state.requireRoleSwitching = action.payload.require_role_switching
                state.billingInterruptEnabled = action.payload.billing_interrupt_enabled
                state.enabledDepartments = action.payload.enabled_departments || []
                state.complianceRules = action.payload.minimum_compliance_rules || {}
            })
            .addCase(fetchHospitalConfig.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update config
            .addCase(updateHospitalConfig.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateHospitalConfig.fulfilled, (state, action) => {
                state.loading = false
                state.config = action.payload
                state.hospitalMode = action.payload.hospital_mode
                state.allowMultiRoleUsers = action.payload.allow_multi_role_users
                state.requireRoleSwitching = action.payload.require_role_switching
                state.billingInterruptEnabled = action.payload.billing_interrupt_enabled
                state.enabledDepartments = action.payload.enabled_departments || []
                state.complianceRules = action.payload.minimum_compliance_rules || {}
            })
            .addCase(updateHospitalConfig.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Toggle department
            .addCase(toggleDepartment.fulfilled, (state, action) => {
                state.enabledDepartments = action.payload
            })
    },
})

export const { clearError, setHospitalMode } = hospitalConfigSlice.actions
export default hospitalConfigSlice.reducer
