import { usePageTitle } from '@booknest/pages'
import { Logo } from '@booknest/ui'
import { type ReactElement, type ReactNode } from 'react'

import { useBackendHealth } from '../hooks/useBackendHealth'

type BackendGateProps = {
  children: ReactNode
}

function LoadingBook(): ReactElement {
  return (
    <div className="bn-backend-book" aria-hidden="true">
      <div className="bn-backend-book-glow" />
      <div className="bn-backend-book-shelf" />
      <div className="bn-backend-book-cover">
        <span className="bn-backend-book-spine" />
        <span className="bn-backend-book-page bn-backend-book-page-left" />
        <span className="bn-backend-book-page bn-backend-book-page-right" />
        <span className="bn-backend-book-bookmark bn-backend-book-bookmark-top" />
        <span className="bn-backend-book-bookmark bn-backend-book-bookmark-bottom" />
      </div>
      <span className="bn-backend-book-dust bn-backend-book-dust-one" />
      <span className="bn-backend-book-dust bn-backend-book-dust-two" />
      <span className="bn-backend-book-dust bn-backend-book-dust-three" />
    </div>
  )
}

function BackendStartupScreen(): ReactElement {
  usePageTitle('Starting BookNest')

  return (
    <div className="bn-backend-shell">
      <section className="bn-backend-card" role="status" aria-live="polite">
        <div className="bn-backend-brand">
          <Logo width="3rem" height="3rem" />
          <div>
            <p className="bn-backend-eyebrow">BookNest</p>
            <h1 className="bn-backend-title">Starting BookNest</h1>
            <p className="bn-backend-badge">Render wake-up in progress</p>
          </div>
        </div>

        <div className="bn-backend-illustration-wrap">
          <LoadingBook />
        </div>

        <p className="bn-backend-copy">
          The backend is hosted on Render and may take a few moments to wake up
          if it has been idle. Once it&apos;s ready, the application will load
          automatically.
        </p>

        <p className="bn-backend-fineprint">
          We’ll continue checking in the background.
        </p>
      </section>
    </div>
  )
}

function BackendTimeoutCard({
  onRetry,
  onReload,
}: {
  onRetry: () => void
  onReload: () => void
}): ReactElement {
  usePageTitle('Backend unavailable')

  return (
    <div className="bn-backend-shell">
      <section className="bn-backend-card bn-backend-card-error" role="alert">
        <div className="bn-backend-brand">
          <Logo width="3rem" height="3rem" />
          <div>
            <p className="bn-backend-eyebrow">BookNest</p>
            <h1 className="bn-backend-title">Starting BookNest</h1>
          </div>
        </div>

        <div className="bn-backend-error-copy">
          <p className="bn-backend-copy">
            The backend is taking longer than expected.
          </p>
          <p className="bn-backend-fineprint">
            Please try again or reload the page.
          </p>
        </div>

        <div className="bn-backend-actions">
          <button
            type="button"
            className="bn-backend-button bn-backend-button-secondary"
            onClick={onRetry}
          >
            Retry
          </button>
          <button
            type="button"
            className="bn-backend-button"
            onClick={onReload}
          >
            Reload Page
          </button>
        </div>
      </section>
    </div>
  )
}

export function BackendGate({ children }: BackendGateProps): ReactElement {
  const { status, retry } = useBackendHealth()

  if (status === 'ready') {
    return <>{children}</>
  }

  if (status === 'error') {
    return (
      <BackendTimeoutCard
        onRetry={retry}
        onReload={() => window.location.reload()}
      />
    )
  }

  return <BackendStartupScreen />
}
