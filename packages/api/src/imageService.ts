import { postData } from './request'

type UploadImageResponse = Record<string, string> & {
  url?: string
}

export async function uploadBookImage(image: File): Promise<string> {
  const formData = new FormData()
  formData.append('image', image)

  const response = await postData<UploadImageResponse, FormData>(
    '/images/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  if (!response.url) {
    throw new Error('Image upload response did not include a URL')
  }

  return response.url
}
