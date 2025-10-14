import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import api from '../services/api'
import { Book } from '../types'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get(`/book/${id}`)
      .then(res => setBook(res.data as Book))
      .catch(err => setError(err?.message || String(err)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>
  if (!book) return <div>No book found</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold">{book.title}</h2>
      <p className="text-sm text-gray-600">by {book.author}</p>
      <div className="mt-4 bg-white p-4 rounded shadow">{book.description}</div>
    </div>
  )
}
