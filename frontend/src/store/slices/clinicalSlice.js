import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

export const createVisit = createAsyncThunk(
    'clinical/createVisit',
    async (visitData, { rejectWithValue }) => {
        try {
            const response = await api.post('/patients/visits', visitData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create visit')
        }
    }
)

export const fetchPatientVisits = createAsyncThunk(
    'clinical/fetchPatientVisits',
    async (patientId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/patients/${patientId}/visits`)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch visits')
        }
    }
)

export const recordVitals = createAsyncThunk(
    'clinical/recordVitals',
    async ({ visitId, vitalsData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/clinical/visits/${visitId}/vitals`, vitalsData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to record vitals')
        }
    }
)

export const recordDiagnosis = createAsyncThunk(
    'clinical/recordDiagnosis',
    async ({ visitId, diagnosisData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/clinical/visits/${visitId}/diagnosis`, diagnosisData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to record diagnosis')
        }
    }
)

export const storeTreatmentNote = createAsyncThunk(
    'clinical/storeTreatmentNote',
    async ({ visitId, noteData }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/clinical/visits/${visitId}/notes`, noteData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to store treatment note')
        }
    }
)

const clinicalSlice = createSlice({
    name: 'clinical',
    initialState: {
        currentVisit: null,
        encounters: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentVisit: (state) => {
            state.currentVisit = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Visit
            .addCase(createVisit.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createVisit.fulfilled, (state, action) => {
                state.loading = false
                state.currentVisit = action.payload
            })
            .addCase(createVisit.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Patient Visits
            .addCase(fetchPatientVisits.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchPatientVisits.fulfilled, (state, action) => {
                state.loading = false
                state.encounters = action.payload
            })
            .addCase(fetchPatientVisits.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Record Vitals
            .addCase(recordVitals.fulfilled, (state, action) => {
                if (state.currentVisit) {
                    state.currentVisit.vitals = action.payload
                }
            })
            // Record Diagnosis
            .addCase(recordDiagnosis.fulfilled, (state, action) => {
                if (state.currentVisit) {
                    state.currentVisit.diagnosis = action.payload.diagnosis
                    state.currentVisit.treatment_plan = action.payload.treatment_plan
                }
            })
    },
})

export const { clearCurrentVisit } = clinicalSlice.actions
export default clinicalSlice.reducer
