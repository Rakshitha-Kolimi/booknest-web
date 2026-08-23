import { getRole } from '@booknest/utils'
import React from 'react'
import { Link } from 'react-router-dom'

import { usePageTitle } from '../PageTitleProvider'

const OPEN_NESTY_EVENT = 'booknest:open-nesty'

const technologyHighlights = [
  'Go backend',
  'REST APIs',
  'PostgreSQL',
  'Redis',
  'JWT authentication',
  'Role-based access',
  'Docker',
  'AWS',
  'GitHub Actions / CI/CD',
  'Nesty AI assistant',
]

const engineeringHighlights = [
  {
    title: 'Go backend',
    description:
      'Layered the BookNest backend as a production-minded Go service instead of a demo-only CRUD API.',
  },
  {
    title: 'Authentication & access control',
    description:
      'Built authentication and access control around JWT sessions and role-based route protection.',
  },
  {
    title: 'Data & caching',
    description:
      'Used PostgreSQL for catalog, cart, order, and user data, with Redis supporting application flows and rate limiting.',
  },
  {
    title: 'Nesty AI assistant',
    description:
      'Shipped Nesty as an embedded assistant to make discovery more personal while still serving a real product use case.',
  },
  {
    title: 'Deployment & delivery',
    description:
      'Used Docker and CI/CD so the stack could be built, shipped, and iterated on consistently.',
  },
]

const profileLinks = [
  {
    label: 'GitHub Work',
    href: 'https://github.com/Rakshitha-Kolimi',
  },
  {
    label: 'GitHub Personal',
    href: 'https://github.com/RakshithaKolimi',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/kolimi-rakshitha-4a6ab0157/',
  },
]

export default function AboutMe(): React.ReactElement {
  usePageTitle('About Me')

  const isAuthenticated = Boolean(getRole())
  const openNesty = () => {
    window.dispatchEvent(new Event(OPEN_NESTY_EVENT))
  }

  return (
    <section className="space-y-5">
      <div className="bn-card rounded-2xl bg-linear-to-r from-orange-100/90 via-amber-50 to-rose-100/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
          About Me
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 md:text-4xl">
          BookNest is a bookstore, but it is also a systems project
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700 md:text-base">
          I am Rakshitha Kolimi, and BookNest was built to explore the parts of
          engineering that sit behind a polished product surface: backend
          design, data modeling, auth, deployment, infrastructure, CI/CD, and
          AI-assisted discovery.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/books" className="bn-button inline-flex px-4 py-2 text-sm">
            Explore Books
          </Link>
        </div>
      </div>

      <article className="bn-card-solid rounded-xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Why BookNest exists
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          BookNest was not built just to showcase a bookstore UI. It was
          intentionally designed as a full-stack engineering project that could
          demonstrate how a real product might be structured, secured, deployed,
          and extended over time.
        </p>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          The goal was to combine user-facing ecommerce flows with backend
          rigor: authenticated sessions, role-based access, durable data
          storage, API design, infrastructure-aware deployment, and AI features
          that feel useful rather than decorative.
        </p>
      </article>

      <article className="bn-card-solid rounded-xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Engineering work behind the project
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {engineeringHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-3"
            >
              <h3 className="text-sm font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm leading-6 text-zinc-700">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </article>

      <article className="bn-card-solid rounded-xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900">
          Tech and feature highlights
        </h2>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          These are the pieces of the stack that make BookNest more than a
          storefront.
        </p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {technologyHighlights.map((item) => (
            <span key={item} className="bn-pill px-3 py-1 text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      </article>

      <article className="bn-card-solid rounded-xl p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-orange-50 ring-1 ring-orange-100">
              <img src="/nesty.png" alt="Nesty AI assistant" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                Meet Nesty
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-700">
                Nesty is the embedded AI assistant for BookNest. It adds a
                conversational layer to book discovery while remaining part of
                the core bookstore experience.
              </p>
            </div>
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={openNesty}
              className="bn-button inline-flex shrink-0 px-4 py-2 text-sm"
            >
              Open Nesty
            </button>
          ) : (
            <Link
              to="/login"
              className="bn-button inline-flex shrink-0 px-4 py-2 text-sm"
            >
              Log in to Use Nesty
            </Link>
          )}
        </div>
      </article>

      <article className="bn-card-solid rounded-xl p-6">
        <h2 className="text-xl font-semibold text-zinc-900">Relevant links</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-700">
          These are the project and professional links that already belong to
          the BookNest story.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {profileLinks.map((link) => (
            <a
              key={`${link.label}-${link.href}`}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-orange-100 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <p className="text-sm font-semibold text-zinc-900 group-hover:text-orange-700">
                {link.label}
              </p>
              <span className="mt-1 block truncate text-xs text-zinc-500">
                {link.href.replace('https://', '')}
              </span>
            </a>
          ))}
        </div>
      </article>
    </section>
  )
}
