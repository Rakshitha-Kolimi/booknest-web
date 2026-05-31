import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { usePageTitle } from '../PageTitleProvider'

import {
  type Book,
  type Review,
  type ReviewListResponse,
} from '@booknest/services'
import { getRole, safeLocalStorage } from '@booknest/utils'
import { formatPrice } from '@booknest/utils'
import {
  getQueryErrorMessage,
  useAddToCartMutation,
  useBookQuery,
  useBookReviewsQuery,
  useUpsertBookReviewMutation,
} from '../query/hooks'

export default function BookDetail(): React.ReactElement {
  // Initialise variables used to determine access and route context.
  const { id } = useParams<{ id: string }>()
  const role = getRole()
  const isAdmin = role === 'ADMIN'
  const userId = safeLocalStorage.get('user_id')
  const canReview = !isAdmin && Boolean(userId)

  // Call query functions before deriving UI-specific values from the data.
  const bookId = id || ''
  const bookQuery = useBookQuery(bookId)
  const reviewsQuery = useBookReviewsQuery(bookId)
  const addToCartMutation = useAddToCartMutation()
  const reviewMutation = useUpsertBookReviewMutation(bookId)
  const book = bookQuery.data ?? null
  const reviews = reviewsQuery.data?.items ?? []
  const loading = bookQuery.isLoading
  const reviewsLoading = reviewsQuery.isLoading

  // Memoize the review summary so the fallback object stays stable.
  const reviewSummary = useMemo<ReviewListResponse['summary']>(
    () =>
      reviewsQuery.data?.summary ?? {
        average_rating: 0,
        total_reviews: 0,
      },
    [reviewsQuery.data]
  )

  const [quantity, setQuantity] = useState(1)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const error = !id
    ? 'Book id is missing in URL'
    : bookQuery.isError
      ? getQueryErrorMessage(bookQuery.error, 'Unable to load book details')
      : addToCartMutation.isError
        ? getQueryErrorMessage(
            addToCartMutation.error,
            'Unable to add selected quantity'
          )
        : ''
  const reviewsError = !id
    ? 'Book id is missing in URL'
    : reviewsQuery.isError
      ? getQueryErrorMessage(reviewsQuery.error, 'Unable to load reviews')
      : reviewMutation.isError
        ? getQueryErrorMessage(reviewMutation.error, 'Unable to save review')
        : ''
  const pageTitle = book?.name
    ? `${book.name}${book.author_name ? ` by ${book.author_name}` : ''}`
    : loading
      ? 'Loading Book'
      : 'Book Details'

  usePageTitle(pageTitle)

  useEffect(() => {
    // Keep the review form aligned with the current user's saved review.
    const existingReview = reviews.find((entry) => entry.user_id === userId)
    if (existingReview) {
      setReviewRating(existingReview.rating)
      setReviewComment(existingReview.comment || '')
      return
    }

    setReviewRating(5)
    setReviewComment('')
  }, [reviews, userId])

  const handleAddToCart = async () => {
    if (!book) return

    try {
      await addToCartMutation.mutateAsync({ bookId: book.id, count: quantity })
      toast.success('Book added to cart successfully')
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e, 'Unable to add selected quantity'))
    }
  }

  const handleReviewSubmit = async () => {
    if (!id) return

    try {
      await reviewMutation.mutateAsync({
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      toast.success('Your review has been saved')
    } catch (e: unknown) {
      toast.error(getQueryErrorMessage(e, 'Unable to save review'))
    }
  }

  const renderStars = (rating: number): string =>
    Array.from({ length: 5 }, (_, index) =>
      index < Math.round(rating) ? '★' : '☆'
    ).join('')

  const getReviewerName = (review: Review): string => {
    const firstName = review.user?.first_name?.trim() || ''
    const lastName = review.user?.last_name?.trim() || ''
    const fullName = `${firstName} ${lastName}`.trim()

    if (fullName) return fullName
    if (review.user?.email) return review.user.email
    if (review.user_id === userId) return 'You'
    return 'BookNest Reader'
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 text-sm text-zinc-600 shadow-sm ring-1 ring-zinc-200">
        Loading book details...
      </div>
    )
  }

  if (!book) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || 'Book not found'}
        </div>
        <Link
          to="/books"
          className="text-sm font-semibold text-zinc-900 underline"
        >
          Back to books
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-5">
      <Link
        to="/books"
        className="text-sm font-semibold text-zinc-700 underline"
      >
        Back to books
      </Link>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <article className="grid gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200 md:grid-cols-[280px_1fr]">
        <div className="h-72 rounded-lg bg-zinc-100 md:h-full">
          {book.image_url ? (
            <img
              src={book.image_url}
              alt={book.name}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-widest text-zinc-500">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">{book.name}</h1>
          <p className="mt-1 text-zinc-600">by {book.author_name}</p>
          {book.categories && book.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {book.categories.map((category) => (
                <span
                  key={category.id}
                  className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-800 ring-1 ring-orange-200"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span className="rounded-md bg-zinc-100 px-3 py-1 text-zinc-700">
              Price: {formatPrice(book.price)}
            </span>
            <span className="rounded-md bg-zinc-100 px-3 py-1 text-zinc-700">
              ISBN: {book.isbn || 'N/A'}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-zinc-700">
            {book.description || 'No description available for this book.'}
          </p>

          <div className="mt-5 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
            <h2 className="text-sm font-semibold text-zinc-900">Summary</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-700">
              {book.summary?.trim()
                ? book.summary
                : 'Summary not available for this book yet.'}
            </p>
          </div>

          {!isAdmin && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <label
                htmlFor="quantity"
                className="text-sm font-medium text-zinc-700"
              >
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={Math.max(book.available_stock, 1)}
                value={quantity}
                onChange={(event) => {
                  const parsed = Number(event.target.value)
                  if (Number.isNaN(parsed) || parsed < 1) {
                    setQuantity(1)
                    return
                  }

                  setQuantity(
                    Math.min(parsed, Math.max(book.available_stock, 1))
                  )
                }}
                className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm"
              />

              <button
                type="button"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                onClick={() => void handleAddToCart()}
                disabled={
                  addToCartMutation.isPending || book.available_stock < 1
                }
              >
                {addToCartMutation.isPending
                  ? 'Adding...'
                  : book.available_stock < 1
                    ? 'Out of Stock'
                    : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </article>

      <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">Reviews</h2>
              <p className="mt-1 text-sm text-zinc-600">
                {reviewSummary.total_reviews > 0
                  ? `${reviewSummary.average_rating.toFixed(1)} / 5 average from ${reviewSummary.total_reviews} review${reviewSummary.total_reviews === 1 ? '' : 's'}`
                  : 'No reviews yet. Be the first to share your thoughts.'}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-right ring-1 ring-amber-200">
              <p className="text-lg font-semibold text-amber-800">
                {reviewSummary.total_reviews > 0
                  ? reviewSummary.average_rating.toFixed(1)
                  : 'New'}
              </p>
              <p className="text-xs uppercase tracking-wide text-amber-700">
                {renderStars(
                  reviewSummary.total_reviews > 0
                    ? reviewSummary.average_rating
                    : 0
                )}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {reviewsLoading && (
              <div className="rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600 ring-1 ring-zinc-200">
                Loading reviews...
              </div>
            )}

            {!reviewsLoading && reviews.length === 0 && (
              <div className="rounded-xl bg-zinc-50 px-4 py-4 text-sm text-zinc-600 ring-1 ring-zinc-200">
                This book does not have any reviews yet.
              </div>
            )}

            {!reviewsLoading &&
              reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {getReviewerName(review)}
                      </p>
                      <p className="text-sm text-amber-700">
                        {renderStars(review.rating)}{' '}
                        <span className="text-zinc-500">
                          ({review.rating}/5)
                        </span>
                      </p>
                    </div>
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      {new Date(review.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-zinc-700">
                    {review.comment || 'No written comment provided.'}
                  </p>
                </article>
              ))}
          </div>
        </article>

        <article className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-2xl font-semibold text-zinc-900">
            Share Your Review
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Only readers who purchased this book can leave or update a review.
          </p>

          {!canReview && (
            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Sign in with a reader account to leave a review.
            </div>
          )}

          {canReview && (
            <form
              className="mt-5 space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleReviewSubmit()
              }}
            >
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Rating
                </span>
                <select
                  value={reviewRating}
                  onChange={(event) => {
                    setReviewRating(Number(event.target.value))
                  }}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value} star{value === 1 ? '' : 's'}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Comment
                </span>
                <textarea
                  value={reviewComment}
                  onChange={(event) => {
                    setReviewComment(event.target.value)
                  }}
                  rows={5}
                  maxLength={1000}
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  placeholder="What stood out to you about this book?"
                />
              </label>

              <button
                type="submit"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-400"
                disabled={reviewMutation.isPending}
              >
                {reviewMutation.isPending ? 'Saving...' : 'Save Review'}
              </button>
            </form>
          )}

          {reviewsError && (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {reviewsError}
            </div>
          )}
        </article>
      </section>
    </section>
  )
}
