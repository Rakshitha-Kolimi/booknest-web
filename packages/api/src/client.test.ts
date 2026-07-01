import type { InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAxiosClient, mockRefreshClient } = vi.hoisted(() => {
  const makeMockClient = () =>
    Object.assign(vi.fn(), {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })

  return {
    mockAxiosClient: makeMockClient(),
    mockRefreshClient: makeMockClient(),
  }
})

vi.mock('axios', () => ({
  default: {
    create: vi
      .fn()
      .mockReturnValueOnce(mockAxiosClient)
      .mockReturnValueOnce(mockRefreshClient),
  },
}))

vi.mock('@booknest/utils', () => ({
  clearAuthSession: vi.fn(),
  safeLocalStorage: {
    get: (key: string) => window.localStorage.getItem(key),
    set: (key: string, value: string) =>
      window.localStorage.setItem(key, value),
    remove: (key: string) => window.localStorage.removeItem(key),
  },
}))

describe('api client', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('adds the bearer token to plain request headers', async () => {
    window.localStorage.setItem('token', 'access-token-1')

    await import('./client')
    const requestHandler =
      mockAxiosClient.interceptors.request.use.mock.calls[0][0]
    const config = {
      headers: {},
    } as InternalAxiosRequestConfig

    requestHandler(config)

    expect(config.headers.Authorization).toBe('Bearer access-token-1')
  })

  it('adds the bearer token through AxiosHeaders when available', async () => {
    window.localStorage.setItem('token', 'access-token-2')

    await import('./client')
    const requestHandler =
      mockAxiosClient.interceptors.request.use.mock.calls[0][0]
    const headers = {
      set: vi.fn(),
    }
    const config = {
      headers,
    } as unknown as InternalAxiosRequestConfig

    requestHandler(config)

    expect(headers.set).toHaveBeenCalledWith(
      'Authorization',
      'Bearer access-token-2'
    )
  })

  it('refreshes and retries requests that used AxiosHeaders authorization', async () => {
    window.localStorage.setItem('refresh_token', 'refresh-token-1')
    mockRefreshClient.post.mockResolvedValue({
      data: { access_token: 'fresh-token' },
    })

    await import('./client')
    const responseErrorHandler =
      mockAxiosClient.interceptors.response.use.mock.calls[0][1]
    const headers = {
      has: vi.fn().mockReturnValue(true),
      set: vi.fn(),
    }
    const originalRequest = {
      headers,
      url: '/cart',
    } as unknown as InternalAxiosRequestConfig

    await responseErrorHandler({
      response: { status: 401 },
      config: originalRequest,
    })

    expect(mockRefreshClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refresh_token: 'refresh-token-1',
    })
    expect(headers.has).toHaveBeenCalledWith('Authorization')
    expect(headers.set).toHaveBeenCalledWith(
      'Authorization',
      'Bearer fresh-token'
    )
    expect(mockAxiosClient).toHaveBeenCalledWith(
      expect.objectContaining({ _retry: true })
    )
  })
})
