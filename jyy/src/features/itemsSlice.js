// itemsSlice.js - API는 건드리지 않고 이것만 수정

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { itemsAPI } from '../api/itemApi'

// 기존 createAsyncThunk들은 그대로
export const fetchItems = createAsyncThunk('items/fetchItems', async (params = {}, { rejectWithValue }) => {
   try {
      const response = await itemsAPI.getItems(params)
      return response
   } catch (error) {
      return rejectWithValue(error.message || '상품 목록을 불러오는데 실패했습니다.')
   }
})

export const fetchItem = createAsyncThunk('items/fetchItem', async (id, { rejectWithValue }) => {
   try {
      const response = await itemsAPI.getItem(id)
      return response
   } catch (error) {
      return rejectWithValue(error.message || '상품을 불러오는데 실패했습니다.')
   }
})

export const createItem = createAsyncThunk('items/createItem', async (itemData, { rejectWithValue }) => {
   try {
      const response = await itemsAPI.createItem(itemData)
      return response
   } catch (error) {
      return rejectWithValue(error.message || '상품 등록에 실패했습니다.')
   }
})

export const updateItem = createAsyncThunk('items/updateItem', async ({ id, itemData }, { rejectWithValue }) => {
   try {
      const response = await itemsAPI.updateItem(id, itemData)
      return { id, ...response }
   } catch (error) {
      return rejectWithValue(error.message || '상품 수정에 실패했습니다.')
   }
})

export const deleteItem = createAsyncThunk('items/deleteItem', async (id, { rejectWithValue }) => {
   try {
      await itemsAPI.deleteItem(id)
      return id
   } catch (error) {
      return rejectWithValue(error.message || '상품 삭제에 실패했습니다.')
   }
})

const itemsSlice = createSlice({
   name: 'items',
   initialState: {
      items: [],
      currentItem: null,
      pagination: {
         currentPage: 1,
         totalPages: 1,
         totalItems: 0,
         hasNext: false,
         hasPrev: false,
      },
      loading: false,
      error: null,
      deleteLoading: false,
   },
   reducers: {
      setCurrentPage: (state, action) => {
         state.pagination.currentPage = action.payload
      },
      clearError: (state) => {
         state.error = null
      },
      clearCurrentItem: (state) => {
         state.currentItem = null
      },
   },
   extraReducers: (builder) => {
      builder
         // fetchItems - 원래대로 복원
         .addCase(fetchItems.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItems.fulfilled, (state, action) => {
            state.loading = false
            // API 응답 구조에 맞게: action.payload = { items: [...], pagination: {...} }
            state.items = action.payload.items || action.payload.data?.items || []
            state.pagination = action.payload.pagination || action.payload.data?.pagination || state.pagination
            state.error = null
         })
         .addCase(fetchItems.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // fetchItem - currentItem만 업데이트 (items 건드리지 않음)
         .addCase(fetchItem.pending, (state) => {
            state.loading = true // detailLoading 없으니까 그냥 loading 사용
            state.error = null
         })
         .addCase(fetchItem.fulfilled, (state, action) => {
            state.loading = false
            state.currentItem = action.payload
            state.error = null
            // items 배열은 절대 건드리지 않음!
         })
         .addCase(fetchItem.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            state.currentItem = null
         })

         // createItem
         .addCase(createItem.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createItem.fulfilled, (state, action) => {
            state.loading = false
            state.items.unshift(action.payload)
            state.error = null
         })
         .addCase(createItem.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // updateItem
         .addCase(updateItem.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateItem.fulfilled, (state, action) => {
            state.loading = false
            const index = state.items.findIndex((item) => item.id === action.payload.id)
            if (index !== -1) {
               state.items[index] = action.payload
            }
            if (state.currentItem && state.currentItem.id === action.payload.id) {
               state.currentItem = action.payload
            }
            state.error = null
         })
         .addCase(updateItem.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // deleteItem
         .addCase(deleteItem.pending, (state) => {
            state.deleteLoading = true
            state.error = null
         })
         .addCase(deleteItem.fulfilled, (state, action) => {
            state.deleteLoading = false
            state.items = state.items.filter((item) => item.id !== action.payload)
            if (state.currentItem && state.currentItem.id === action.payload) {
               state.currentItem = null
            }
            state.error = null
         })
         .addCase(deleteItem.rejected, (state, action) => {
            state.deleteLoading = false
            state.error = action.payload
         })
   },
})

export const { setCurrentPage, clearError, clearCurrentItem } = itemsSlice.actions
export default itemsSlice.reducer
