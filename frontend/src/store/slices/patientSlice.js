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
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients')
        }
    }
)

export const fetchPatientById = createAsyncThunk(
    'patient/fetchPatientById',
    async (id, { rejectWithValue, getState }) => {
        try {
            // First check if patient is in the offline sync queue
            const state = getState()
            const queuedItem = state.sync?.queue?.find(
                item => item.url === '/patients' &&
                    item.method === 'post' &&
                    item.data?.id === id
            )

            if (queuedItem) {
                return {
                    ...queuedItem.data,
                    isQueued: true
                }
            }

            // If not in queue, fetch from API
            const response = await api.get(`/patients/${id}`)
            return response.data
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
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to create patient')
        }
    }
)

export const updatePatient = createAsyncThunk(
    'patient/updatePatient',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/patients/${id}`, data)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error?.message || 'Failed to update patient')
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
                state.patients = action.payload.data
                state.pagination = {
                    current_page: action.payload.current_page,
                    per_page: action.payload.per_page,
                    total: action.payload.total,
                    total_pages: action.payload.last_page,
                }
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
            // Update patient
            .addCase(updatePatient.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updatePatient.fulfilled, (state, action) => {
                state.loading = false
                state.currentPatient = action.payload
                // Update in the list if present
                const index = state.patients.findIndex(p => p.id === action.payload.id)
                if (index !== -1) {
                    state.patients[index] = action.payload
                }
            })
            .addCase(updatePatient.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearCurrentPatient, clearError } = patientSlice.actions
export default patientSlice.reducer
