import { getErrorMessage } from '@booknest/services'
import { safeLocalStorage } from '@booknest/utils'
import { getRole } from '@booknest/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

import { usePageTitle } from '../PageTitleProvider'
import {
  useResendEmailVerificationMutation,
  useResendMobileOtpMutation,
  useUpdateUserPreferencesMutation,
  useUserProfileQuery,
  useVerifyMobileMutation,
} from '../query/hooks'

export default function Profile(): React.ReactElement {
  usePageTitle('Profile')

  // Initialise variables that drive user lookup and role-based links.
  const userID = safeLocalStorage.get('user_id') || ''
  const role = getRole() || 'READER'

  // Call query functions before shaping the profile view model.
  const profileQuery = useUserProfileQuery(userID)
  const resendEmailMutation = useResendEmailVerificationMutation()
  const resendMobileMutation = useResendMobileOtpMutation()
  const verifyMobileMutation = useVerifyMobileMutation(userID)
  const updatePreferencesMutation = useUpdateUserPreferencesMutation(userID)

  const [mobileOTP, setMobileOTP] = useState('')
  const [optimisticUseSms, setOptimisticUseSms] = useState<boolean | null>(null)

  // Build a stable UI-friendly user object from the query response.
  const user = useMemo(
    () => ({
      first_name: profileQuery.data?.first_name || '',
      last_name: profileQuery.data?.last_name || '',
      email:
        profileQuery.data?.email ||
        safeLocalStorage.get('email') ||
        'Unavailable',
      mobile: profileQuery.data?.mobile || 'Unavailable',
      email_verified: profileQuery.data?.email_verified ?? true,
      mobile_verified: profileQuery.data?.mobile_verified ?? true,
      use_sms:
        optimisticUseSms !== null
          ? optimisticUseSms
          : (profileQuery.data?.use_sms ?? false),
      created_at: profileQuery.data?.created_at || '',
    }),
    [optimisticUseSms, profileQuery.data]
  )
  const loadingProfile = profileQuery.isLoading

  const fullName =
    `${user.first_name} ${user.last_name}`.trim() ||
    safeLocalStorage.get('name') ||
    'BookNest User'
  const email = user.email
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
  const joinedDate = (() => {
    if (!user.created_at) return 'Unavailable'

    const createdAt = new Date(user.created_at)
    if (Number.isNaN(createdAt.getTime())) return 'Unavailable'

    return createdAt.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  })()

  useEffect(() => {
    if (profileQuery.isError) {
      toast.error(
        getErrorMessage(profileQuery.error, 'Unable to load profile details.')
      )
    }
  }, [profileQuery.error, profileQuery.isError])

  const handleResendEmailVerification = async () => {
    try {
      await resendEmailMutation.mutateAsync(user.email)
      toast.success('Verification email sent. Check your inbox.')
    } catch (error: unknown) {
      toast.error(
        getErrorMessage(error, 'Unable to resend verification email.')
      )
    }
  }

  const handleResendMobileOTP = async () => {
    try {
      await resendMobileMutation.mutateAsync()
      toast.success('Verification code sent to your mobile.')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to resend mobile OTP.'))
    }
  }

  const handleVerifyMobile = async () => {
    if (!mobileOTP.trim()) {
      toast.error('Enter the OTP sent to your mobile number.')
      return
    }

    try {
      await verifyMobileMutation.mutateAsync(mobileOTP.trim())
      setMobileOTP('')
      toast.success('Mobile number verified successfully.')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Unable to verify mobile OTP.'))
    }
  }

  const handleNotificationPreferenceChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!userID) return

    const nextValue = event.target.checked
    const previousValue = user.use_sms

    setOptimisticUseSms(nextValue)

    try {
      await updatePreferencesMutation.mutateAsync({ use_sms: nextValue })
      toast.success(
        nextValue
          ? 'SMS notifications enabled for your account.'
          : 'SMS notifications turned off.'
      )
    } catch (error: unknown) {
      setOptimisticUseSms(previousValue)
      toast.error(
        getErrorMessage(error, 'Unable to update notification preference.')
      )
    }
  }

  return (
    <section className="space-y-4">
      <div className="bn-card rounded-2xl bg-linear-to-r from-orange-100/90 via-amber-50 to-rose-100/80 p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight text-zinc-900 md:text-4xl">
          Profile
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-700">
          Manage your account details and access your activity faster.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <article className="bn-card-solid rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-orange-600 to-rose-500 text-lg font-semibold text-white">
              {initials || 'BN'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {fullName}
              </h2>
              <p className="text-sm text-zinc-600">{email}</p>
              <p className="text-sm text-zinc-600">{user.mobile}</p>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Role
              </dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">
                {role}
              </dd>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Member Since
              </dt>
              <dd className="mt-1 text-sm font-semibold text-zinc-900">
                {joinedDate}
              </dd>
            </div>
          </dl>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email Verification
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                {loadingProfile
                  ? 'Loading...'
                  : user.email_verified
                    ? 'Verified'
                    : 'Not verified'}
              </p>
              {!loadingProfile && !user.email_verified && (
                <>
                  <p className="mt-2 text-sm text-zinc-600">
                    Send a fresh verification link to your email address.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendEmailVerification}
                    disabled={resendEmailMutation.isPending}
                    className="mt-4 inline-flex rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {resendEmailMutation.isPending
                      ? 'Sending...'
                      : 'Resend Verification Email'}
                  </button>
                </>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Mobile Verification
              </p>
              <p className="mt-2 text-sm font-semibold text-zinc-900">
                {loadingProfile
                  ? 'Loading...'
                  : user.mobile_verified
                    ? 'Verified'
                    : 'Not verified'}
              </p>
              {!loadingProfile && !user.mobile_verified && (
                <>
                  <p className="mt-2 text-sm text-zinc-600">
                    Request a new OTP and enter it here to verify your mobile
                    number.
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleResendMobileOTP}
                      disabled={resendMobileMutation.isPending}
                      className="inline-flex rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resendMobileMutation.isPending
                        ? 'Sending...'
                        : 'Send Mobile OTP'}
                    </button>
                    <input
                      type="text"
                      value={mobileOTP}
                      onChange={(event) => setMobileOTP(event.target.value)}
                      placeholder="Enter OTP"
                      className="rounded-xl border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none ring-0 transition focus:border-orange-400"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyMobile}
                      disabled={verifyMobileMutation.isPending}
                      className="inline-flex rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {verifyMobileMutation.isPending
                        ? 'Verifying...'
                        : 'Verify Mobile'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Notification Preference
            </p>
            <label
              htmlFor="sms-notifications"
              className="mt-3 flex items-start gap-3"
              aria-label="Send me SMS updates"
            >
              <input
                id="sms-notifications"
                type="checkbox"
                checked={user.use_sms}
                onChange={handleNotificationPreferenceChange}
                disabled={loadingProfile || updatePreferencesMutation.isPending}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500 disabled:cursor-not-allowed"
              />
              <span>
                <span className="block text-sm font-semibold text-zinc-900">
                  Send me SMS updates
                </span>
                <span className="mt-1 block text-sm text-zinc-600">
                  Includes order-related SMS notifications. Leave this unchecked
                  to stop SMS messages.
                </span>
              </span>
            </label>
            <p className="mt-3 text-xs text-zinc-500">
              {updatePreferencesMutation.isPending
                ? 'Saving your preference...'
                : user.use_sms
                  ? 'SMS notifications are currently enabled.'
                  : 'SMS notifications are currently turned off.'}
            </p>
          </div>
        </article>

        <aside className="bn-card-solid rounded-xl p-6">
          <h3 className="text-base font-semibold text-zinc-900">
            Quick Actions
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            Jump directly to the sections you use most.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={role === 'ADMIN' ? '/admin/orders' : '/orders'}
              className="bn-button inline-flex px-3 py-2 text-sm"
            >
              View Orders
            </Link>
            <Link
              to="/books"
              className="inline-flex rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
            >
              Browse Books
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
