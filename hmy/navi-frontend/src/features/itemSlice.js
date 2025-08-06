import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getItems, createItem, getItemById, updateItem, deleteItem } from '../api/itemApi'

// Thunks
export const fetchItemsThunk = createAsyncThunk('items/fetchItems', getItems)
export const createItemThunk = createAsyncThunk('items/createItem', createItem)
export const getItemThunk = createAsyncThunk('items/getItem', getItemById)
export const updateItemThunk = createAsyncThunk('items/updateItem', ({ id, data }) => updateItem(id, data))
export const deleteItemThunk = createAsyncThunk('items/deleteItem', deleteItem)

// Initial State
const initialState = {
   items: [],
   pagination: {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 5,
   },
   selectedItem: null,
   loading: false,
   error: null,
}

// Slice
const itemSlice = createSlice({
   name: 'items',
   initialState,
   reducers: {
      resetSelectedItem(state) {
         state.selectedItem = null
      },
   },
   extraReducers: (builder) => {
      builder
         // Fetch Items
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
            state.error = action.error.message
         })

         // Create Item
         .addCase(createItemThunk.fulfilled, (state, action) => {
            state.items.unshift(action.payload)
         })

         // Get One Item
         .addCase(getItemThunk.fulfilled, (state, action) => {
            state.selectedItem = action.payload
         })

         // Update Item
         .addCase(updateItemThunk.fulfilled, (state, action) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id)
            if (index !== -1) {
               state.items[index] = action.payload
            }
         })

         // Delete Item
         .addCase(deleteItemThunk.fulfilled, (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload)
         })
   },
})

export const { resetSelectedItem } = itemSlice.actions
export default itemSlice.reducer
