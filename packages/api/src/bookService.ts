import { deleteData, getData, postData, putData } from './request'

export type BookCategory = {
  id: string
  name: string
}

export type BookAuthor = {
  id: string
  name: string
}

export type Book = {
  id: string
  name: string
  author_name: string
  author_id: string
  author?: BookAuthor
  available_stock: number
  image_url?: string | null
  is_active: boolean
  description: string
  summary: string
  isbn?: string | null
  price: number
  discount_percentage: number
  publisher_id: string
  categories?: BookCategory[]
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}

export type Review = {
  id: string
  book_id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
  user?: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
  }
}

export type ReviewInput = {
  rating: number
  comment: string
}

export type ReviewSummary = {
  average_rating: number
  total_reviews: number
}

export type ReviewListResponse = {
  items: Review[]
  summary: ReviewSummary
}

export type BookInput = {
  name: string
  author_name: string
  author_id?: string
  available_stock: number
  image_url?: string
  is_active: boolean
  description: string
  isbn?: string
  price: number
  discount_percentage: number
  publisher_id: string
  category_ids?: string[]
}

export type ListBooksQueryParams = {
  limit?: number
  offset?: number
  cursor?: string
  search?: string
  isbn?: string
  book_name?: string
  author_name?: string
  publisher_name?: string
  category?: string
}

export type BookSearchResult = {
  items: Book[]
  total: number
  limit: number
  offset: number
  next_cursor?: string
  has_more: boolean
}

export async function listBooks(): Promise<Book[]> {
  return getData<Book[]>('/books')
}

export async function queryBooks(
  params?: ListBooksQueryParams
): Promise<BookSearchResult> {
  return getData<BookSearchResult>('/books/search', { params })
}

export async function getBookById(id: string): Promise<Book> {
  return getData<Book>(`/books/${id}`)
}

export async function createBook(payload: BookInput): Promise<Book> {
  return postData<Book, BookInput>('/books', payload)
}

export async function listBookReviews(id: string): Promise<ReviewListResponse> {
  return getData<ReviewListResponse>(`/books/${id}/reviews`)
}

export async function upsertBookReview(
  id: string,
  payload: ReviewInput
): Promise<Review> {
  return postData<Review, ReviewInput>(`/books/${id}/reviews`, payload)
}

export async function updateBook(
  id: string,
  payload: BookInput
): Promise<Book> {
  return putData<Book, BookInput>(`/books/${id}`, payload)
}

export async function deleteBook(id: string): Promise<void> {
  await deleteData(`/books/${id}`)
}

export async function getRecommendations(limit = 4): Promise<Book[]> {
  return getData<Book[]>('/books/recommend', { params: { limit } })
}

export async function semanticSearch(
  query: string,
  limit = 10
): Promise<Book[]> {
  return getData<Book[]>('/books/semantic-search', {
    params: { q: query, limit },
  })
}
