import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { type Book, type ListBooksQueryParams } from '@booknest/services'
import { getRole } from '@booknest/utils'

import { usePageTitle } from '../PageTitleProvider'
import {
  getQueryErrorMessage,
  useAddToCartMutation,
  useBooksQuery,
} from '../query/hooks'

import { formatPrice } from '@booknest/utils'

type PaginationMode = 'offset' | 'cursor'

const PAGE_SIZE = 12

export default function Books(): React.ReactElement {
  // Initialise variables used across pagination and navigation.
  const navigate = useNavigate()
  const role = getRole()
  const isAdmin = role === 'ADMIN'
  usePageTitle(isAdmin ? 'Manage Books' : 'Books')

  const [mode, setMode] = useState<PaginationMode>('offset')
  const [offset, setOffset] = useState(0)
  const [nextCursor, setNextCursor] = useState('')
  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [currentCursor, setCurrentCursor] = useState('')
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const params = useMemo<ListBooksQueryParams>(
    () => ({
      limit: PAGE_SIZE,
      ...(mode === 'offset'
        ? { offset }
        : currentCursor
          ? { cursor: currentCursor }
          : {}),
    }),
    [currentCursor, mode, offset]
  )

  // Call query functions after the pagination and search inputs are ready.
  const booksQuery = useBooksQuery(params)
  const addToCartMutation = useAddToCartMutation()
  const books = booksQuery.data?.items ?? []
  const loading = booksQuery.isLoading || booksQuery.isFetching
  const error = booksQuery.isError
    ? getQueryErrorMessage(booksQuery.error, 'Failed to load books')
    : addToCartMutation.isError
      ? getQueryErrorMessage(
          addToCartMutation.error,
          'Unable to add book to cart'
        )
      : ''

  useEffect(() => {
    setTotal(booksQuery.data?.total ?? 0)
    setHasMore(booksQuery.data?.has_more ?? false)
    setNextCursor(booksQuery.data?.next_cursor || '')
  }, [booksQuery.data])

  const handleAddToCart = async (bookId: string) => {
    try {
      await addToCartMutation.mutateAsync({ bookId, count: 1 })
      toast.success('Book added to cart successfully')
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e, 'Unable to add book to cart'))
    }
  }

  const openBookDetails = (bookId: string) => {
    navigate(`/books/${bookId}`)
  }

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const getReviewLabel = (book: Book): string | null => {
    if (book.total_reviews < 1) {
      return null
    }

    return `${book.average_rating.toFixed(1)} stars · ${book.total_reviews} review${book.total_reviews === 1 ? '' : 's'}`
  }

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Books</h1>
          <p className="text-sm text-zinc-600">
            {isAdmin
              ? 'Review the catalog and jump into admin book creation.'
              : 'Browse books and add them to your cart.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value as PaginationMode
              setMode(nextMode)
              setOffset(0)
              setCurrentCursor('')
              setCursorStack([])
            }}
            className="bn-input px-3 py-2 text-sm"
          >
            <option value="offset">Offset</option>
            <option value="cursor">Cursor</option>
          </select>
          {isAdmin && (
            <Link to="/admin/manage" className="bn-button px-4 py-2 text-sm">
              Manage
            </Link>
          )}
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bn-card-solid rounded-xl p-6 text-sm text-zinc-600">
          Loading books...
        </div>
      ) : books.length === 0 ? (
        <div className="bn-card-solid rounded-xl p-6 text-sm text-zinc-600">
          No books found.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <article
              key={book.id}
              className="bn-card-solid flex h-full cursor-pointer flex-col rounded-xl p-4 transition hover:-translate-y-0.5"
              onClick={() => openBookDetails(book.id)}
              onKeyDown={(event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  openBookDetails(book.id)
                }
              }}
              role="link"
              tabIndex={0}
            >
              <div className="mb-4 h-40 rounded-md bg-zinc-100">
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt={book.name}
                    className="h-full w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
                    No image
                  </div>
                )}
              </div>

              <h2 className="text-lg font-semibold text-zinc-900">
                {book.name || 'Untitled'}
              </h2>
              <p className="text-sm text-zinc-600">
                {book?.author?.name || 'Unknown author'}
              </p>
              <p className="text-xs text-zinc-500">
                Category:{' '}
                {book.categories?.map((item) => item.name).join(', ') ||
                  'Uncategorized'}
              </p>
              {book.categories && book.categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {book.categories.map((bookCategory) => (
                    <span
                      key={bookCategory.id}
                      className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 ring-1 ring-orange-200"
                    >
                      {bookCategory.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-zinc-900">
                  {formatPrice(book.price)}
                </span>
                {isAdmin && (
                  <span className="bn-pill px-2 py-0.5 text-xs">
                    Stock: {book.available_stock}
                  </span>
                )}
                {!isAdmin && getReviewLabel(book) && (
                  <span className="text-xs text-zinc-500">
                    {getReviewLabel(book)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                {!isAdmin && (
                  <button
                    type="button"
                    className="bn-button px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={(event) => {
                      event.stopPropagation()
                      void handleAddToCart(book.id)
                    }}
                    disabled={
                      addToCartMutation.isPending || book.available_stock < 1
                    }
                  >
                    {addToCartMutation.isPending &&
                    addToCartMutation.variables?.bookId === book.id
                      ? 'Adding...'
                      : book.available_stock < 1
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="bn-card-solid flex flex-col gap-2 rounded-xl p-4 text-sm md:flex-row md:items-center md:justify-between">
        {mode === 'offset' ? (
          <p className="text-zinc-600">
            Page {currentPage} of {totalPages} ({total} books)
          </p>
        ) : (
          <p className="text-zinc-600">
            Cursor mode ({books.length} books loaded)
          </p>
        )}

        <div className="flex items-center gap-2">
          {mode === 'offset' ? (
            <>
              <button
                type="button"
                className="bn-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() =>
                  setOffset((value) => Math.max(0, value - PAGE_SIZE))
                }
                disabled={offset === 0 || loading}
              >
                Previous
              </button>
              <button
                type="button"
                className="bn-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setOffset((value) => value + PAGE_SIZE)}
                disabled={loading || offset + PAGE_SIZE >= total}
              >
                Next
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bn-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  if (cursorStack.length === 0) {
                    setCurrentCursor('')
                    return
                  }
                  const previousCursor = cursorStack[cursorStack.length - 1]
                  setCursorStack((stack) => stack.slice(0, -1))
                  setCurrentCursor(previousCursor)
                }}
                disabled={
                  loading || (cursorStack.length === 0 && currentCursor === '')
                }
              >
                Previous
              </button>
              <button
                type="button"
                className="bn-button px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => {
                  setCursorStack((stack) => [...stack, currentCursor])
                  setCurrentCursor(nextCursor)
                }}
                disabled={loading || !hasMore || !nextCursor}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
