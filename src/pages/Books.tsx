import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../services/api'
import { Book } from '../types'

export default function Books() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .get('/books')
      .then(res => setBooks(res.data as Book[]))
      .catch(err => setError(err?.message || String(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Error: {error}</div>

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Books</h2>
      <ul className="space-y-2">
        {books.map((b: Book) => (
          <li key={b.id} className="bg-white p-4 rounded shadow">
            <Link to={`/books/${b.id}`} className="font-medium text-blue-600">
              {b.title}
            </Link>
            <div className="text-sm text-gray-600">{b.author}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
