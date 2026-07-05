const DEFAULT_API_BASE = 'http://localhost:8080'
const API_VERSION_PREFIX = '/api/v1'

const configuredBaseURL = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE
const normalizedBaseURL = configuredBaseURL.replace(/\/+$/, '')

export function getApiBaseUrl(): string {
  return normalizedBaseURL.endsWith(API_VERSION_PREFIX)
    ? normalizedBaseURL
    : `${normalizedBaseURL}${API_VERSION_PREFIX}`
}

export function getBackendHealthUrl(): string {
  try {
    return new URL('/health', normalizedBaseURL).toString()
  } catch {
    return `${normalizedBaseURL.replace(/\/api\/v1$/, '')}/health`
  }
}
