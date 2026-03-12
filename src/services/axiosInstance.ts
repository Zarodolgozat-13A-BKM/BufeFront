import axios from 'axios'
import { getStoredToken } from './tokenStorage'

const API_URL = import.meta.env.VITE_API_URL || 'https://bufeapi.jcloud.jedlik.cloud/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
