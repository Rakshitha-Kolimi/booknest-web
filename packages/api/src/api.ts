import axios from 'axios'

// Read from Vite environment variables
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

export default api
