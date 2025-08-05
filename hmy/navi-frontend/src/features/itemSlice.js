import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getItems } from '../api/itemApi'

// 전체 상품 리스트 가져오기
export const fetchItemsThunk = createAsyncThunk('items/fetchItems', async (data, { rejectWithValue }) => {
   try {
      console.log('data:', data)
      const response = await getItems(data)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

const itemSlice = createSlice({
   name: 'items',
   initialState: {
      item: null, // 상품 단일 정보
      items: [], // 상품 리스트
      pagination: null,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // 전체 상품 리스트 가져오기
         .addCase(fetchItemsThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItemsThunk.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload.items
            state.pagination = action.payload.pagination
         })
         .addCase(fetchItemsThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default itemSlice.reducer
