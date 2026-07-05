import { getBackendHealthUrl } from '@booknest/services'
import { useEffect, useState } from 'react'

const HEALTH_POLL_INTERVAL_MS = 2000
const HEALTH_REQUEST_TIMEOUT_MS = 1900
const HEALTH_WARMUP_TIMEOUT_MS = 60000

export type BackendHealthStatus = 'checking' | 'ready' | 'error'

export interface BackendHealthState {
  status: BackendHealthStatus
  retry: () => void
}

async function fetchHealthCheck(): Promise<boolean> {
  const controller = new window.AbortController()
  const timeoutId = window.setTimeout(
    () => controller.abort(),
    HEALTH_REQUEST_TIMEOUT_MS
  )

  try {
    const response = await fetch(getBackendHealthUrl(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    return response.ok
  } catch (error) {
    if (error instanceof window.DOMException && error.name === 'AbortError') {
      return false
    }

    return false
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export function useBackendHealth(): BackendHealthState {
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<BackendHealthStatus>('checking')

  useEffect(() => {
    let cancelled = false
    let timedOut = false
    let pollTimer: number | undefined
    let timeoutTimer: number | undefined

    const stop = (): void => {
      cancelled = true
      if (pollTimer !== undefined) {
        window.clearTimeout(pollTimer)
      }
      if (timeoutTimer !== undefined) {
        window.clearTimeout(timeoutTimer)
      }
    }

    const markReady = (): void => {
      if (cancelled || timedOut) return
      timedOut = true
      stop()
      setStatus('ready')
    }

    const markError = (): void => {
      if (cancelled || timedOut) return
      timedOut = true
      stop()
      setStatus('error')
    }

    const scheduleNextProbe = (): void => {
      if (cancelled || timedOut) return
      pollTimer = window.setTimeout(() => {
        void probe()
      }, HEALTH_POLL_INTERVAL_MS)
    }

    const probe = async (): Promise<void> => {
      if (cancelled || timedOut) return

      const isHealthy = await fetchHealthCheck()

      if (cancelled || timedOut) return

      if (isHealthy) {
        markReady()
        return
      }

      scheduleNextProbe()
    }

    timeoutTimer = window.setTimeout(() => {
      markError()
    }, HEALTH_WARMUP_TIMEOUT_MS)

    void probe()

    return stop
  }, [attempt])

  return {
    status,
    retry: () => {
      setStatus('checking')
      setAttempt((current) => current + 1)
    },
  }
}
