import { BookNestQueryProvider, PageTitleProvider } from '@booknest/pages'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from './App'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('renders without crashing', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    )

    const { container } = render(
      <BookNestQueryProvider>
        <PageTitleProvider defaultTitle="BookNest">
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </PageTitleProvider>
      </BookNestQueryProvider>
    )
    expect(container).toBeTruthy()
  })

  it('renders the About Me page at /about-me', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    )

    render(
      <BookNestQueryProvider>
        <PageTitleProvider defaultTitle="BookNest">
          <MemoryRouter initialEntries={['/about-me']}>
            <App />
          </MemoryRouter>
        </PageTitleProvider>
      </BookNestQueryProvider>
    )

    expect(
      await screen.findByRole('heading', { name: /BookNest is a bookstore/i })
    ).toBeInTheDocument()
  })
})
