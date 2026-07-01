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

import { chatWithNesty, clearChatHistory, getChatHistory } from './aiService'

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('chatWithNesty posts the user message to /ai/chat', async () => {
    const response = {
      message: 'Hi there!',
      references: [
        {
          id: '1',
          name: 'Test Book',
          price: 9.99,
          image_url: 'http://example.com/book.jpg',
        },
      ],
    }
    mockClient.post.mockResolvedValue({ data: response })

    const data = await chatWithNesty('Hello, Nesty!')

    expect(mockClient.post).toHaveBeenCalledWith(
      '/ai/chat',

      {
        message: 'Hello, Nesty!',
      },
      undefined
    )
    expect(data).toEqual(response)
  })

  it('getChatHistory fetches /ai/chat/history', async () => {
    const history = [
      {
        id: 'm1',
        user_id: 'u1',
        role: 'user' as const,
        content: 'Hello',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'm2',
        user_id: 'u1',
        role: 'assistant' as const,
        content: 'Hi!',
        created_at: '2026-01-01T00:00:01Z',
      },
    ]
    mockClient.get.mockResolvedValue({ data: history })

    const data = await getChatHistory()

    expect(mockClient.get).toHaveBeenCalledWith('/ai/chat/history', undefined)
    expect(data).toEqual(history)
  })

  it('clearChatHistory deletes /ai/chat/history', async () => {
    mockClient.delete.mockResolvedValue({ data: undefined })

    await clearChatHistory()

    expect(mockClient.delete).toHaveBeenCalledWith(
      '/ai/chat/history',
      undefined
    )
  })
})
