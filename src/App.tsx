import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import BookDetail from './pages/BookDetail'
import Books from './pages/Books'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">BookNest</h1>
          <nav className="space-x-4">
            <Link to="/" className="text-blue-600">
              Home
            </Link>
            <Link to="/books" className="text-blue-600">
              Books
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetail />} />
        </Routes>
      </main>
    </div>
  )
}
