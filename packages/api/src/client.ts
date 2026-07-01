import { clearAuthSession, safeLocalStorage } from '@booknest/utils'
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

const API_VERSION_PREFIX = '/api/v1'
const configuredBaseURL =
  import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, '')
const baseURL = normalizedBaseURL.endsWith(API_VERSION_PREFIX)
  ? normalizedBaseURL
  : `${normalizedBaseURL}${API_VERSION_PREFIX}`

const client = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let refreshPromise: Promise<string> | null = null

function setBearerToken(
  config: InternalAxiosRequestConfig,
  token: string
): void {
  const authorization = `Bearer ${token}`

  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', authorization)
    return
  }

  config.headers.Authorization = authorization
}

function hasBearerToken(config?: InternalAxiosRequestConfig): boolean {
  if (!config) return false

  if (typeof config.headers.has === 'function') {
    return config.headers.has('Authorization')
  }

  return Boolean(config.headers.Authorization || config.headers.authorization)
}

function forceLogout(): void {
  clearAuthSession()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

function isRefreshRequest(url?: string): boolean {
  return url?.includes('/refresh') === true
}

async function requestNewAccessToken(): Promise<string> {
  const refreshToken = safeLocalStorage.get('refresh_token')
  if (!refreshToken) {
    throw new Error('missing refresh token')
  }

  try {
    const response = await refreshClient.post<{ access_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    )

    if (!response.data?.access_token) {
      throw new Error('missing access token in refresh response')
    }

    safeLocalStorage.set('token', response.data.access_token)
    return response.data.access_token
  } catch (error) {
    const axiosError = error as AxiosError
    if (axiosError.response?.status === 404) {
      // Backward compatibility for environments still exposing /refresh.
      const fallbackResponse = await refreshClient.post<{
        access_token: string
      }>('/refresh', { refresh_token: refreshToken })
      if (!fallbackResponse.data?.access_token) {
        throw new Error('missing access token in refresh response')
      }
      safeLocalStorage.set('token', fallbackResponse.data.access_token)
      return fallbackResponse.data.access_token
    }
    throw error
  }
}

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = safeLocalStorage.get('token')
  if (token) {
    setBearerToken(config, token)
  }

  return config
})

// When JWT Token expires, navigate user to login screen
client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const sentBearerToken = hasBearerToken(originalRequest)
    const shouldAttemptRefresh =
      status === 401 &&
      sentBearerToken &&
      !originalRequest?._retry &&
      !isRefreshRequest(originalRequest?.url)

    if (!shouldAttemptRefresh || !originalRequest) {
      return Promise.reject(error)
    }

    try {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = requestNewAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newAccessToken = await refreshPromise
      setBearerToken(originalRequest, newAccessToken)
      return client(originalRequest)
    } catch {
      forceLogout()
      return Promise.reject(error)
    }
  }
)

export default client
