import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import clientsReducer from './slices/clientsSlice.js'
import tasksReducer from './slices/tasksSlice.js'
import uiReducer from './slices/uiSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    tasks: tasksReducer,
    ui: uiReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})