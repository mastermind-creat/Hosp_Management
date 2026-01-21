import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    theme: localStorage.getItem('theme') || 'light',
    sidebarOpen: true,
    notifications: [],
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
    },
})

export const {
    toggleTheme,
    toggleSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer
