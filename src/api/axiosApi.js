import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_URL

const naviApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
   },
   withCredentials: true,
})

export default naviApi
