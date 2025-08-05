import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { itemsAPI } from '../api/itemApi'

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

const initialItemsState = {
   items: [],
   currentItem: null,
   pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 10,
   },
   loading: false,
   error: null,
   createLoading: false,
   updateLoading: false,
   deleteLoading: false,
}

const itemsSlice = createSlice({
   name: 'items',
   initialState: initialItemsState,
   reducers: {
      clearError: (state) => {
         state.error = null
      },
      clearCurrentItem: (state) => {
         state.currentItem = null
      },
      setCurrentPage: (state, action) => {
         state.pagination.currentPage = action.payload
      },
   },
   extraReducers: (builder) => {
      builder
         // fetchItems
         .addCase(fetchItems.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItems.fulfilled, (state, action) => {
            state.loading = false
            state.items = action.payload.items || action.payload.data?.items || []
            state.pagination = action.payload.pagination || state.pagination
         })
         .addCase(fetchItems.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // fetchItem
         .addCase(fetchItem.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItem.fulfilled, (state, action) => {
            state.loading = false
            state.currentItem = action.payload.item || action.payload.data
         })
         .addCase(fetchItem.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // createItem
         .addCase(createItem.pending, (state) => {
            state.createLoading = true
            state.error = null
         })
         .addCase(createItem.fulfilled, (state, action) => {
            state.createLoading = false
            console.log(action.payload)
            const newItem = action.payload.item || action.payload.data
            state.items.unshift(newItem)
         })
         .addCase(createItem.rejected, (state, action) => {
            state.createLoading = false
            state.error = action.payload
         })

         // updateItem
         .addCase(updateItem.pending, (state) => {
            state.updateLoading = true
            state.error = null
         })
         .addCase(updateItem.fulfilled, (state, action) => {
            state.updateLoading = false
            const index = state.items.findIndex((item) => item.id === action.payload.id)
            if (index !== -1) {
               state.items[index] = { ...state.items[index], ...action.payload }
            }
            if (state.currentItem && state.currentItem.id === action.payload.id) {
               state.currentItem = { ...state.currentItem, ...action.payload }
            }
         })
         .addCase(updateItem.rejected, (state, action) => {
            state.updateLoading = false
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
         })
         .addCase(deleteItem.rejected, (state, action) => {
            state.deleteLoading = false
            state.error = action.payload
         })
   },
})

export const { clearError: clearItemsError, clearCurrentItem, setCurrentPage } = itemsSlice.actions
export default itemsSlice.reducer
