import api from './api'
import { toast } from 'react-hot-toast'

class OfflineService {
    constructor() {
        this.isOnline = navigator.onLine
        this.store = null
    }

    init(store) {
        this.store = store
        window.addEventListener('online', () => {
            this.isOnline = true
            this.syncQueue()
        })
        window.addEventListener('offline', () => {
            this.isOnline = false
        })

        // Initial sync check
        if (this.isOnline) {
            this.syncQueue()
        }
    }

    async syncQueue() {
        if (!this.store) return

        const state = this.store.getState()
        const { queue, isSyncing } = state.sync
        const { removeFromQueue, setSyncing } = await import('../store/slices/syncSlice')

        if (queue.length === 0 || isSyncing) return

        this.store.dispatch(setSyncing(true))
        toast.loading('Syncing offline data...', { id: 'sync-status' })

        for (const action of queue) {
            try {
                const { method, url, data, params } = action
                await api({
                    method,
                    url,
                    data,
                    params,
                    headers: { 'X-Offline-Sync': 'true' } // Flag to avoid re-queueing
                })
                this.store.dispatch(removeFromQueue(action.id))
            } catch (error) {
                console.error(`Failed to sync action ${action.id}:`, error)
            }
        }

        this.store.dispatch(setSyncing(false))
        toast.success('Offline data synced successfully', { id: 'sync-status' })
    }
}

const offlineService = new OfflineService()
export default offlineService
