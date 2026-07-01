import '../common/index.css'

import { getErrorMessage } from '@booknest/services'
import { Header } from '@booknest/ui'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { usePageTitle } from '../../PageTitleProvider'
import {
  useResendEmailVerificationMutation,
  useVerifyEmailMutation,
} from '../../query/hooks'

type VerificationState = 'pending' | 'success' | 'error'

export default function VerifyEmail(): React.ReactElement {
  usePageTitle('Verify Email')

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')?.trim() || ''
  const token = searchParams.get('token')

  // Initialize state based on token presence to avoid setState in effect
  const [status, setStatus] = useState<VerificationState>(
    !token ? 'error' : 'pending'
  )
  const [message, setMessage] = useState(
    !token
      ? 'The verification link is missing a token.'
      : 'Verifying your email...'
  )
  const verifyEmailMutation = useVerifyEmailMutation()
  const resendEmailMutation = useResendEmailVerificationMutation()

  useEffect(() => {
    if (!token) {
      return
    }

    let active = true

    verifyEmailMutation
      .mutateAsync(token)
      .then(() => {
        if (!active) {
          return
        }
        setStatus('success')
        setMessage('Your email has been verified. Redirecting to login...')
        window.setTimeout(() => {
          navigate('/login')
        }, 1800)
      })
      .catch((error: unknown) => {
        if (!active) return
        setStatus('error')
        setMessage(
          getErrorMessage(error, 'Email verification failed. Please try again.')
        )
      })

    return () => {
      active = false
    }
  }, [navigate, searchParams, token, verifyEmailMutation])

  const handleResend = async () => {
    if (!email) {
      setMessage('The email address is missing from this verification link.')
      return
    }

    try {
      await resendEmailMutation.mutateAsync(email)
      setMessage('A new verification link has been sent to your email.')
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, 'Unable to resend verification email.'))
    }
  }

  return (
    <div className="form">
      <div className="form-container">
        <div className="form">
          <Header className="login-logo" />
          <h3 className="log-in-text">Email Verification</h3>
          <p className="mt-4 text-center text-sm leading-6 text-zinc-600">
            {message}
          </p>

          {status === 'success' && (
            <Link to="/login" className="btn-login mt-6 text-center">
              Go to Login
            </Link>
          )}

          {status === 'error' && (
            <div className="mt-6 space-y-3">
              <Link to="/login" className="btn-login block text-center">
                Back to Login
              </Link>
              {email ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendEmailMutation.isPending}
                  className="btn-login"
                >
                  {resendEmailMutation.isPending
                    ? 'Sending...'
                    : 'Resend Verification Email'}
                </button>
              ) : (
                <p className="text-center text-xs text-zinc-500">
                  This link does not include an email address for resending.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
