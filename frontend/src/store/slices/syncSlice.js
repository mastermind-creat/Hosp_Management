import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
    queue: [],
    isSyncing: false,
}

const syncSlice = createSlice({
    name: 'sync',
    initialState,
    reducers: {
        addToQueue: (state, action) => {
            state.queue.push({
                id: uuidv4(),
                ...action.payload,
                timestamp: new Date().toISOString(),
            })
        },
        removeFromQueue: (state, action) => {
            state.queue = state.queue.filter(item => item.id !== action.payload)
        },
        setSyncing: (state, action) => {
            state.isSyncing = action.payload
        },
        clearQueue: (state) => {
            state.queue = []
        }
    }
})

export const { addToQueue, removeFromQueue, setSyncing, clearQueue } = syncSlice.actions
export default syncSlice.reducer
