import { configureStore } from '@reduxjs/toolkit'
import itemsReducer from '../features/itemsSlice'
import authReducer from '../features/authSlice'

const store = configureStore({
   reducer: {
      items: itemsReducer,
      auth: authReducer,
   },
})

export default store
