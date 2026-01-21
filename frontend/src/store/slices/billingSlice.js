import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import billingService from '../../services/billingService'

export const fetchInvoices = createAsyncThunk(
    'billing/fetchInvoices',
    async (params, { rejectWithValue }) => {
        try {
            const data = await billingService.getInvoices(params)
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices')
        }
    }
)

export const fetchInvoiceById = createAsyncThunk(
    'billing/fetchInvoiceById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await billingService.getInvoiceById(id)
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice')
        }
    }
)

export const createInvoice = createAsyncThunk(
    'billing/createInvoice',
    async (invoiceData, { rejectWithValue }) => {
        try {
            const data = await billingService.createInvoice(invoiceData)
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create invoice')
        }
    }
)

export const recordPayment = createAsyncThunk(
    'billing/recordPayment',
    async (paymentData, { rejectWithValue }) => {
        try {
            const data = await billingService.recordPayment(paymentData)
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to record payment')
        }
    }
)

const billingSlice = createSlice({
    name: 'billing',
    initialState: {
        invoices: [],
        currentInvoice: null,
        loading: false,
        error: null,
        stats: {
            total_pending: 0,
            total_paid: 0,
            collection_rate: 0
        }
    },
    reducers: {
        clearCurrentInvoice: (state) => {
            state.currentInvoice = null
        },
        clearError: (state) => {
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Invoices
            .addCase(fetchInvoices.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.loading = false
                state.invoices = action.payload.data || action.payload
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch Invoice By ID
            .addCase(fetchInvoiceById.fulfilled, (state, action) => {
                state.currentInvoice = action.payload
            })
            // Create Invoice
            .addCase(createInvoice.pending, (state) => {
                state.loading = true
            })
            .addCase(createInvoice.fulfilled, (state, action) => {
                state.loading = false
                state.invoices.unshift(action.payload)
            })
            .addCase(createInvoice.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    }
})

export const { clearCurrentInvoice, clearError } = billingSlice.actions
export default billingSlice.reducer
