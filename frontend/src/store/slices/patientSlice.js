import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchPatients = createAsyncThunk(
    'patient/fetchPatients',
    async ({ page = 1, search = '' }, { rejectWithValue }) => {
        try {
            const response = await api.get('/patients', {
                params: { page, search, per_page: 20 },
            })
            return response.data.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch patients')
        }
    }
)

export const fetchPatientById = createAsyncThunk(
    'patient/fetchPatientById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/patients/${id}`)
            return response.data.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch patient')
        }
    }
)

export const createPatient = createAsyncThunk(
    'patient/createPatient',
    async (patientData, { rejectWithValue }) => {
        try {
            const response = await api.post('/patients', patientData)
            return response.data.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create patient')
        }
    }
)

const initialState = {
    patients: [],
    currentPatient: null,
    pagination: {
        current_page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
    },
    loading: false,
    error: null,
}

const patientSlice = createSlice({
    name: 'patient',
    initialState,
    reducers: {
        clearCurrentPatient: (state) => {
            state.currentPatient = null
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch patients
            .addCase(fetchPatients.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPatients.fulfilled, (state, action) => {
                state.loading = false
                state.patients = action.payload.patients
                state.pagination = action.payload.pagination
            })
            .addCase(fetchPatients.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch patient by ID
            .addCase(fetchPatientById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPatientById.fulfilled, (state, action) => {
                state.loading = false
                state.currentPatient = action.payload
            })
            .addCase(fetchPatientById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create patient
            .addCase(createPatient.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createPatient.fulfilled, (state, action) => {
                state.loading = false
                state.patients.unshift(action.payload)
            })
            .addCase(createPatient.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearCurrentPatient, clearError } = patientSlice.actions
export default patientSlice.reducer
