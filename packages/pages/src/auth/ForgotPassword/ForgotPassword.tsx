import '../common/index.css'

import { getErrorMessage } from '@booknest/services'
import { Button, Header } from '@booknest/ui'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { usePageTitle } from '../../PageTitleProvider'
import { useForgotPasswordMutation } from '../../query/hooks'

export default function ForgotPassword(): React.ReactElement {
  const navigate = useNavigate()
  usePageTitle('Forgot Password')
  const [formData, setFormData] = useState({
    email: '',
  })
  const forgotPasswordMutation = useForgotPasswordMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: formData.email.trim(),
      })

      toast.success('Password Reset Link Sent!')
      if (response.reset_token) {
        navigate(
          `/reset-password?token=${encodeURIComponent(response.reset_token)}`
        )
      } else {
        navigate('/reset-successful')
      }
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Forgot password failed. Please try again.')
      )
    }
  }

  /**
   * Render components
   */
  return (
    <div className="form">
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <Header className="login-logo" />
          <h3 className="log-in-text">Forgot Password</h3>
          <p className="sign-up-text">
            Enter your registered email address and we will send you
            instructions to reset your password
          </p>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            className="log-in-input"
            required
            onChange={handleChange}
          />

          <p className="sign-up-text">
            Remember your password?{' '}
            <Link to="/login" className="sign-up-link">
              Login
            </Link>
          </p>
          <Button
            label={
              forgotPasswordMutation.isPending
                ? 'Sending...'
                : 'Send Reset Link'
            }
            className="btn-login"
            type="submit"
            disabled={forgotPasswordMutation.isPending}
          />
        </form>
      </div>
    </div>
  )
}
