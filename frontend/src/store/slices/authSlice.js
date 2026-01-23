import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials)
            // Backend returns: { access_token, token_type, expires_in, user, permissions, active_role, available_roles, hospital_mode, can_switch_roles }
            const { access_token } = response.data

            // Store token in localStorage
            localStorage.setItem('token', access_token)

            return { token: access_token, ...response.data }
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
            // Backend returns: { user, permissions, active_role, available_roles, hospital_mode, can_switch_roles }
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to get user')
        }
    }
)

export const switchRole = createAsyncThunk(
    'auth/switchRole',
    async (roleId, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/switch-role', { role_id: roleId })
            // Backend returns: { message, active_role, switched_at }
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || 'Failed to switch role')
        }
    }
)

const initialState = {
    user: null,
    permissions: [],
    activeRole: null,
    availableRoles: [],
    hospitalMode: 'FULL',
    canSwitchRoles: false,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
    roleSwitching: false,
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
            state.activeRole = action.payload.active_role || null
            state.availableRoles = action.payload.available_roles || []
            state.hospitalMode = action.payload.hospital_mode || 'FULL'
            state.canSwitchRoles = action.payload.can_switch_roles || false
            state.isAuthenticated = true
        },
        setActiveRole: (state, action) => {
            state.activeRole = action.payload
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

                // Extract permissions and role context
                state.permissions = action.payload.permissions || []
                state.activeRole = action.payload.active_role || null
                state.availableRoles = action.payload.available_roles || []
                state.hospitalMode = action.payload.hospital_mode || 'FULL'
                state.canSwitchRoles = action.payload.can_switch_roles || false

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
                state.activeRole = null
                state.availableRoles = []
                state.hospitalMode = 'FULL'
                state.canSwitchRoles = false
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
                state.activeRole = action.payload.active_role || null
                state.availableRoles = action.payload.available_roles || []
                state.hospitalMode = action.payload.hospital_mode || 'FULL'
                state.canSwitchRoles = action.payload.can_switch_roles || false
                state.isAuthenticated = true
            })
            .addCase(getCurrentUser.rejected, (state) => {
                state.loading = false
                state.isAuthenticated = false
                state.token = null
                state.user = null
                state.permissions = []
                state.activeRole = null
                state.availableRoles = []
                localStorage.removeItem('token')
            })
            // Switch role
            .addCase(switchRole.pending, (state) => {
                state.roleSwitching = true
                state.error = null
            })
            .addCase(switchRole.fulfilled, (state, action) => {
                state.roleSwitching = false
                state.activeRole = action.payload.active_role
                state.error = null
            })
            .addCase(switchRole.rejected, (state, action) => {
                state.roleSwitching = false
                state.error = action.payload
            })
    },
})

export const { clearError, setUser, setActiveRole } = authSlice.actions
export default authSlice.reducer
