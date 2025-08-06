import { configureStore } from '@reduxjs/toolkit'
import itemsReducer from '../features/itemsSlice'
import authReducer from '../features/authSlice'
import keywordsReducer from '../features/keywordSlice'

const store = configureStore({
   reducer: {
      items: itemsReducer,
      auth: authReducer,
      keyword: keywordsReducer,
   },
})

export default store
