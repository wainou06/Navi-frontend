import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { registerUser, loginUser, checkAuthStatus } from '../api/authApi'
import { postKeyword, getKeyword } from '../api/keywordApi' // 키워드 API 추가

// User-related Thunks
export const registerUserThunk = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
   try {
      const response = await registerUser(userData)
      return response.data.user
   } catch (error) {
      console.log(error)
      return rejectWithValue(error.response?.data.message)
   }
})

export const loginUserThunk = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
   try {
      const response = await loginUser(credentials)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
   try {
      const response = await logoutuser()
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

export const checkAuthStatusThunk = createAsyncThunk('auth/checkAuthStatus', async (_, { rejectWithValue }) => {
   try {
      const response = await checkAuthStatus()
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

// Keyword-related Thunks
export const postKeywordThunk = createAsyncThunk('keyword/postKeyword', async (name, { rejectWithValue }) => {
   try {
      const response = await postKeyword(name)
      return response.data // 성공 시 키워드 데이터 반환
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

export const getKeywordThunk = createAsyncThunk('keyword/getKeyword', async (_, { rejectWithValue }) => {
   try {
      const response = await getKeyword()
      return response.data // 성공 시 키워드 데이터 반환
   } catch (error) {
      return rejectWithValue(error.response?.data?.message)
   }
})

// Slice
const slice = createSlice({
   name: 'keywordslice',
   initialState: {
      user: null,
      isAuthenticated: false,
      loading: true,
      error: null,
      keywords: [], // 키워드를 저장할 배열
   },
   reducers: {
      clearAuthError: (state) => {
         state.error = null
      },
   },
   extraReducers: (builder) => {
      builder
         // User-related actions
         .addCase(registerUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(registerUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(registerUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         .addCase(loginUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(loginUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
            state.isAuthenticated = true
         })
         .addCase(loginUserThunk.rejected, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(logoutUserThunk.pending, (state) => {
            state.loading = true
         })
         .addCase(logoutUserThunk.fulfilled, (state) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
         })
         .addCase(logoutUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         .addCase(checkAuthStatusThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            state.isAuthenticated = action.payload.isAuthenticated
            state.user = action.payload.user || null
         })
         .addCase(checkAuthStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            state.isAuthenticated = false
            state.user = null
         })

         // Keyword-related actions
         .addCase(postKeywordThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(postKeywordThunk.fulfilled, (state, action) => {
            state.loading = false
            // 새로 추가된 키워드를 keywords 배열에 추가
            state.keywords.push(action.payload)
         })
         .addCase(postKeywordThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         .addCase(getKeywordThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getKeywordThunk.fulfilled, (state, action) => {
            state.loading = false
            state.keywords = action.payload // 키워드 목록 업데이트
         })
         .addCase(getKeywordThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export const { clearAuthError } = slice.actions
export default slice.reducer // 슬라이스 리듀서 내보내기
