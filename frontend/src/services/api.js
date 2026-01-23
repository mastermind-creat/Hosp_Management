import axios from 'axios'
import { addToQueue } from '../store/slices/syncSlice'
import { toast } from 'react-hot-toast'

const isTauri = !!window.__TAURI_INTERNALS__;
const api = axios.create({
    baseURL: isTauri ? 'http://localhost:8080/api/v1' : '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle errors & offline
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { config, response } = error

        // Handle Unauthorized
        if (response?.status === 401) {
            localStorage.removeItem('token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        // Handle Offline / Network Error
        const isNetworkError = !response && !error.status
        const isMutation = ['post', 'put', 'delete', 'patch'].includes(config?.method?.toLowerCase())
        const isOfflineSync = config?.headers?.['X-Offline-Sync'] === 'true'

        if (isNetworkError && isMutation && !isOfflineSync) {
            // Dynamically import store to avoid circular dependency
            const { store } = await import('../store')

            // Queue the mutation
            store.dispatch(addToQueue({
                method: config.method,
                url: config.url,
                data: JSON.parse(config.data || '{}'),
                params: config.params,
            }))

            toast.success('Offline: Action queued for sync', {
                icon: '⏳',
            })

            // Return a mock successful response to prevent UI from breaking
            return Promise.resolve({ data: { message: 'Action queued', data: JSON.parse(config.data || '{}') } })
        }

        return Promise.reject(error)
    }
)

export default api
