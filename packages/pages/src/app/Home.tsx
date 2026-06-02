import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { usePageTitle } from '../PageTitleProvider'
import { useRecommendationsQuery } from '../query/hooks'

import { getRole } from '@booknest/utils'
import { formatPrice } from '@booknest/utils'

export default function Home(): React.ReactElement {
  const role = getRole()
  usePageTitle(role === 'ADMIN' ? 'Admin Workspace' : 'Home')

  const { data: recommendations, isLoading: recLoading } =
    useRecommendationsQuery()

  const cards = useMemo(
    () =>
      role === 'ADMIN'
        ? [
            {
              title: 'Manage Catalog',
              description:
                'Create and maintain books, publishers, and authors.',
              path: '/admin/manage',
              cta: 'Open Manage',
            },
            {
              title: 'Track All Orders',
              description: 'View customer orders and their payment status.',
              path: '/admin/orders',
              cta: 'Open Admin Orders',
            },
          ]
        : [
            {
              title: 'Browse Books',
              description: 'Search and explore available titles.',
              path: '/books',
              cta: 'Explore Books',
            },
            {
              title: 'My Cart',
              description: 'Review selected books and proceed to checkout.',
              path: '/cart',
              cta: 'Open Cart',
            },
            {
              title: 'My Orders',
              description: 'Track your placed orders and payment outcome.',
              path: '/orders',
              cta: 'View Orders',
            },
          ],
    [role]
  )

  const showRecommendations = role !== 'ADMIN'

  return (
    <section className="space-y-6">
      <div className="bn-card rounded-2xl bg-linear-to-r from-orange-100/90 via-amber-50 to-rose-100/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
          BookNest
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 md:text-4xl">
          {role === 'ADMIN' ? 'Admin Workspace' : 'Discover Your Next Book'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-700">
          {role === 'ADMIN'
            ? 'Upload books, monitor orders, and keep operations moving from one place.'
            : 'Browse books, build your cart, checkout, and manage your orders like an e-commerce flow.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.path}
            className="bn-card-solid rounded-xl p-5 transition hover:-translate-y-0.5"
          >
            <h2 className="text-lg font-semibold text-zinc-900">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-600">{card.description}</p>
            <Link
              to={card.path}
              className="bn-button mt-4 inline-flex px-3 py-2 text-sm"
            >
              {card.cta}
            </Link>
          </article>
        ))}
      </div>

      {showRecommendations && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Recommended for You
          </h2>

          {recLoading && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bn-card-solid animate-pulse rounded-xl p-4"
                >
                  <div className="h-40 rounded-lg bg-zinc-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-zinc-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          )}

          {!recLoading && recommendations && recommendations.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {recommendations.map((book) => {
                const discountedPrice =
                  book.discount_percentage > 0
                    ? book.price * (1 - book.discount_percentage / 100)
                    : null

                return (
                  <Link
                    key={book.id}
                    to={`/books/${book.id}`}
                    className="bn-card-solid group rounded-xl p-4 transition hover:-translate-y-0.5"
                  >
                    <div className="h-40 w-full overflow-hidden rounded-lg bg-zinc-100">
                      {book.image_url ? (
                        <img
                          src={book.image_url}
                          alt={book.name}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-zinc-400 text-sm">
                          No cover
                        </div>
                      )}
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-zinc-900">
                      {book.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {book.author_name}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      {discountedPrice !== null ? (
                        <>
                          <span className="text-sm font-semibold text-zinc-900">
                            {formatPrice(discountedPrice)}
                          </span>
                          <span className="text-xs text-zinc-400 line-through">
                            {formatPrice(book.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold text-zinc-900">
                          {formatPrice(book.price)}
                        </span>
                      )}
                    </div>

                    {book.average_rating > 0 && (
                      <p className="mt-1 text-xs text-zinc-500">
                        ★ {book.average_rating.toFixed(1)} · {book.total_reviews}{' '}
                        review{book.total_reviews === 1 ? '' : 's'}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          )}

          {!recLoading && (!recommendations || recommendations.length === 0) && (
            <p className="text-sm text-zinc-500">
              Complete your first order to get personalised recommendations.
            </p>
          )}
        </section>
      )}
    </section>
  )
}
