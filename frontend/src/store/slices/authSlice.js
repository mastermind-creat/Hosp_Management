import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            // Backend returns: { access_token, token_type, expires_in, user }
            const { access_token, user } = response.data

            // Store token in localStorage
            localStorage.setItem('token', access_token)

            return { token: access_token, user }
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Login failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/auth/logout')
            localStorage.removeItem('token')
            return null
        } catch (error) {
            // Even if API call fails, clear local storage
            localStorage.removeItem('token')
            return null
        }
    }
)

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/auth/me')
            // Backend returns: { user, permissions }
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to get user')
        }
    }
)

const initialState = {
    user: null,
    permissions: [], // Added permissions to state
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload.user
            state.permissions = action.payload.permissions || []
            state.isAuthenticated = true
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.token = action.payload.token
                state.user = action.payload.user
                // Extract permissions from the payload (AuthController logic)
                state.permissions = action.payload.user?.roles?.flatMap(role => role.permissions.map(p => p.name)) || []

                // Fallback: If backend sends permissions separately (which it does now)
                if (action.payload.permissions) {
                    state.permissions = action.payload.permissions
                }

                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.isAuthenticated = false
                state.token = null
                state.user = null
                state.permissions = []
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.permissions = []
                state.token = null
                state.isAuthenticated = false
                state.error = null
            })
            // Get current user
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload.user
                state.permissions = action.payload.permissions || []
                state.isAuthenticated = true
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false
                state.isAuthenticated = false
                state.token = null
                state.user = null
                state.permissions = []
                localStorage.removeItem('token')
            })
    },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
