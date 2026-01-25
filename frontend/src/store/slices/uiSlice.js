import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: true,
    notifications: [],
    compactMode: localStorage.getItem('compactMode') === 'true',
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false', // Default to true
}

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light'
            localStorage.setItem('theme', state.theme)

            // Update document class
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen
        },
        addNotification: (state, action) => {
            state.notifications.push({
                id: Date.now(),
                ...action.payload,
            })
        },
        removeNotification: (state, action) => {
            state.notifications = state.notifications.filter(
                (notification) => notification.id !== action.payload
            )
        },
        clearNotifications: (state) => {
            state.notifications = []
        },
        toggleCompactMode: (state) => {
            state.compactMode = !state.compactMode
            localStorage.setItem('compactMode', state.compactMode)
        },
        toggleSound: (state) => {
            state.soundEnabled = !state.soundEnabled
            localStorage.setItem('soundEnabled', state.soundEnabled)
        },
    },
})

export const {
    toggleTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleCompactMode,
    toggleSound,
} = uiSlice.actions

export default uiSlice.reducer
