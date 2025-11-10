import '../common/index.css'

import { Button, Header } from '@booknest/ui'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPassword(): React.ReactElement {
  /**
   * Runs an effect to set the page title
   */
  useEffect(() => {
    document.title = 'Forgot Password'
  }, [])

  /**
   * Render components
   */
  return (
    <div className="form">
      <div className="form-container">
        <form className="form">
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
          />

          <p className="sign-up-text">
            Remember your password?{' '}
            <Link to="/login" className="sign-up-link">
              Login
            </Link>
          </p>
          <Button
            label="Send Reset Link"
            className="btn-login"
            onClick={() => {
              window.location.href = '/reset-successful'
            }}
            type="submit"
          />
        </form>
      </div>
    </div>
  )
}
