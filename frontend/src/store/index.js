import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import patientReducer from './slices/patientSlice'
import syncReducer from './slices/syncSlice'

import clinicalReducer from './slices/clinicalSlice'
import billingReducer from './slices/billingSlice'
import labReducer from './slices/labSlice'
import hospitalConfigReducer from './slices/hospitalConfigSlice'

const persistConfig = {
    key: 'hospital-root',
    version: 1,
    storage,
    whitelist: ['auth', 'ui', 'patient', 'sync', 'clinical', 'billing', 'lab', 'hospitalConfig'], // Persist these slices
}

const rootReducer = combineReducers({
    auth: authReducer,
    ui: uiReducer,
    patient: patientReducer,
    sync: syncReducer,
    clinical: clinicalReducer,
    billing: billingReducer,
    lab: labReducer,
    hospitalConfig: hospitalConfigReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'auth/login/fulfilled'],
            },
        }),
})

export const persistor = persistStore(store)
export default store
