import { Login, Register } from '@booknest/pages'
import { Header } from '@booknest/ui'
import { safeLocalStorage } from '@booknest/utils'
import React from 'react'
import { Link, Route, Routes } from 'react-router-dom'

import BookDetail from '../src/Pages/BookDetail'
import Books from '../src/Pages/Books'
import Home from '../src/Pages/Home'
import Profile from '../src/Pages/Profile'
import PrivateRoute from './routes/PrivateRoute'
import PublicRoute from './routes/PublicRoute'

export default function App() {
  const isAuthenticated = safeLocalStorage.get('token')
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Header />
          {isAuthenticated && (
            <>
              <nav className="space-x-4">
                <Link to="/" className="text-blue-600">
                  Home
                </Link>
                <Link to="/books" className="text-blue-600">
                  Books
                </Link>
              </nav>
            </>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route
            path="/register"
            element={<PublicRoute element={<Register />} />}
          />

          <Route path="/" element={<PrivateRoute element={<Home />} />} />
          <Route path="/books" element={<PrivateRoute element={<Books />} />} />
          <Route
            path="/books/:id"
            element={<PrivateRoute element={<BookDetail />} />}
          />
          <Route
            path="/profile"
            element={<PrivateRoute element={<Profile />} />}
          />
        </Routes>
      </main>
    </div>
  )
}
