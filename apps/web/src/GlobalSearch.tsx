import { type Book, semanticSearch } from '@booknest/services'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GlobalSearch(): React.ReactElement {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Book[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await semanticSearch(trimmed, 6)
        setResults(data)
        setOpen(true)
      } catch {
        setError('Search failed. Please try again.')
        setResults([])
        setOpen(true)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const handleSelect = (book: Book) => {
    setOpen(false)
    setQuery('')
    navigate(`/books/${book.id}`)
  }

  return (
    <div ref={wrapperRef} className="relative w-64 md:w-80">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search"
          className="bn-input w-full py-2 pl-9 pr-3 text-sm"
        />
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        {loading && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
            ···
          </span>
        )}
      </div>

      {open && (
        <div className="bn-card-solid absolute left-0 top-full z-50 mt-1.5 w-full overflow-hidden rounded-xl py-1 shadow-lg">
          {error ? (
            <p className="px-3 py-2 text-xs text-rose-600">{error}</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-zinc-500">No results found.</p>
          ) : (
            <ul>
              {results.map((book) => (
                <li key={book.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(book)}
                    className="w-full px-3 py-2 text-left transition-colors hover:bg-orange-50"
                  >
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {book.name}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {book.author?.name ?? 'Unknown author'}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
