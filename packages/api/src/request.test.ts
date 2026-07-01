import type { AxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockClient } = vi.hoisted(() => ({
  mockClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('./client', () => ({
  default: mockClient,
}))

import { deleteData, getData, postData, putData } from './request'

describe('request helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getData returns response data', async () => {
    const config: AxiosRequestConfig = { params: { q: 'x' } }
    mockClient.get.mockResolvedValue({ data: { ok: true } })

    const data = await getData<{ ok: boolean }>('/test', config)

    expect(mockClient.get).toHaveBeenCalledWith('/test', config)
    expect(data).toEqual({ ok: true })
  })

  it('postData forwards body and config', async () => {
    const body = { name: 'Book' }
    const config: AxiosRequestConfig = { headers: { 'x-id': '1' } }
    mockClient.post.mockResolvedValue({ data: { id: 1 } })

    const data = await postData<{ id: number }, typeof body>(
      '/books',
      body,
      config
    )

    expect(mockClient.post).toHaveBeenCalledWith('/books', body, config)
    expect(data).toEqual({ id: 1 })
  })

  it('putData forwards body and config', async () => {
    mockClient.put.mockResolvedValue({ data: { updated: true } })

    const data = await putData<{ updated: boolean }, { name: string }>(
      '/books/1',
      {
        name: 'Updated',
      }
    )

    expect(mockClient.put).toHaveBeenCalledWith(
      '/books/1',
      { name: 'Updated' },
      undefined
    )
    expect(data).toEqual({ updated: true })
  })

  it('deleteData returns response data', async () => {
    mockClient.delete.mockResolvedValue({ data: { removed: true } })

    const data = await deleteData<{ removed: boolean }>('/books/1')

    expect(mockClient.delete).toHaveBeenCalledWith('/books/1', undefined)
    expect(data).toEqual({ removed: true })
  })
})
