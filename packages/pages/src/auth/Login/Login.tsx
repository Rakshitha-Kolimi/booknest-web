import '../common/index.css'

import { Button, Header } from '@booknest/ui'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Login(): React.ReactElement {
  /**
   * Runs an effect to set the page title
   */
  useEffect(() => {
    document.title = 'Login'
  }, [])

  /**
   * Render components
   */
  return (
    <div className="form">
      <div className="form-container">
        <form className="form">
          <Header className="login-logo" />
          <h3 className="log-in-text">Log in</h3>
          <p className="sign-up-text">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="sign-up-link">
              Sign up
            </Link>
          </p>
          <input
            name="email"
            type="email"
            placeholder="Email address"
            className="log-in-input"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="log-in-input"
          />
          <div className="forgot-password-text">Forgot Password?</div>
          <Button label="Login" className="btn-login" />
        </form>
      </div>
    </div>
  )
}
