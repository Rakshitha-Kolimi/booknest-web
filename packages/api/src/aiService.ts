import { postData } from './request'

export interface AIChatRequest {
  session_id?: string
  message: string
  prompt?: string
}

export interface BookReference {
  id: string
  name: string
  price: number
  image_url: string
}

export interface AIChatResponse {
  session_id?: string
  message: string
  references?: BookReference[]
}

export async function chatWithNesty(
  message: string,
  options?: { prompt?: string; session_id?: string }
): Promise<AIChatResponse> {
  const requestBody = { message } as AIChatRequest

  if (options?.prompt) {
    requestBody.prompt = options.prompt
  }

  if (options?.session_id) {
    requestBody.session_id = options.session_id
  }

  return postData<AIChatResponse, AIChatRequest>(
    '/ai/chat',
    requestBody as AIChatRequest
  )
}

export interface BackendChatMessage {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}
