import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import labService from '../../services/labService';

// Thunks
export const fetchLabTests = createAsyncThunk(
    'lab/fetchTests',
    async (params, { rejectWithValue }) => {
        try {
            return await labService.getTests(params);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab tests');
        }
    }
);

export const fetchLabRequests = createAsyncThunk(
    'lab/fetchRequests',
    async (params, { rejectWithValue }) => {
        try {
            return await labService.getRequests(params);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch lab requests');
        }
    }
);

export const createLabRequest = createAsyncThunk(
    'lab/createRequest',
    async (data, { rejectWithValue }) => {
        try {
            return await labService.createRequest(data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create lab request');
        }
    }
);

export const updateSampleCollection = createAsyncThunk(
    'lab/collectSample',
    async ({ requestId, data }, { rejectWithValue }) => {
        try {
            return await labService.collectSample(requestId, data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to collect sample');
        }
    }
);

export const enterLabResult = createAsyncThunk(
    'lab/enterResult',
    async ({ requestId, data }, { rejectWithValue }) => {
        try {
            return await labService.enterResult(requestId, data);
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to enter results');
        }
    }
);

const initialState = {
    tests: [],
    requests: [],
    loading: false,
    error: null,
    totalTests: 0,
    totalRequests: 0,
    currentPage: 1,
    totalPages: 1
};

const labSlice = createSlice({
    name: 'lab',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tests
            .addCase(fetchLabTests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLabTests.fulfilled, (state, action) => {
                state.loading = false;
                state.tests = action.payload.data;
                state.totalTests = action.payload.total;
                // Assuming pagination metadata might be present differently or just data/total
            })
            .addCase(fetchLabTests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Requests
            .addCase(fetchLabRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLabRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.requests = action.payload.data;
                state.totalRequests = action.payload.total;
                state.currentPage = action.payload.current_page;
                state.totalPages = action.payload.last_page;
            })
            .addCase(fetchLabRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Request
            .addCase(createLabRequest.fulfilled, (state, action) => {
                state.requests.unshift(action.payload);
            })
            // Sample Collection
            .addCase(updateSampleCollection.fulfilled, (state, action) => {
                const index = state.requests.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.requests[index] = action.payload;
                }
            })
            // Enter Result
            .addCase(enterLabResult.fulfilled, (state) => {
                // Usually we'd update the request status, but maybe just refetching is safer for full result object
                // For now, let's trigger a reload in component or update if payload returns full request object
            });
    }
});

export const { clearError } = labSlice.actions;
export default labSlice.reducer;
