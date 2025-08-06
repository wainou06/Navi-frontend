import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

export const registerUser = async (userData) => {
   try {
      const response = await api.post('/auth/register', userData)
      return response
   } catch (error) {
      console.error(`API request 오류: ${error}`)
      throw error
   }
}

export const loginUser = async (credential) => {
   try {
      const response = await api.post('/auth/login', credential)
      return response
   } catch (error) {
      console.error(`API Request 오류 : ${error}`)
      throw error
   }
}

export const logoutuser = async () => {
   try {
      const response = await api.get('/auth/logout')
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

export const checkAuthStatus = async () => {
   try {
      const response = await api.get('/auth/status')
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

export const postKeyword = async (name) => {
   try {
      const config = {
         headers: {
            'Content-Type': 'application/json',
         },
      }
      const response = await api.post('/keyword', { name: name }, config)
      return response
   } catch (error) {
      console.error(`API Request 오류: ${error}`)
      throw error
   }
}

export const getKeyword = async () => {
   try {
      const response = await api.get('/keyword')
      return response
   } catch (error) {
      console.error(`API Reques 오류: ${error}`)
      throw error
   }
}
