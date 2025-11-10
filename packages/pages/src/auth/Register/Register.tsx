import '../common/index.css'

import { Button, Header } from '@booknest/ui'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import Dialog from './Terms&Privacy/Terms&Privacy'

export default function Register(): React.ReactElement {
  const [open, setOpen] = useState(false)
  /**
   * Runs an effect to set the page title
   */
  useEffect(() => {
    document.title = 'Register'
  }, [])

  /**
   * Render components
   */
  return (
    <div className="form">
      <div className="form-container">
        <form className="form">
          <Header className="login-logo" />
          <h3 className="log-in-text">Create Account</h3>
          <p className="sign-up-text">
            Already have an account?{' '}
            <Link to="/login" className="sign-up-link">
              Log in
            </Link>
          </p>

          <input
            name="name"
            type="name"
            placeholder="Full name"
            className="log-in-input"
          />
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
          <input
            name="confirm_password"
            type="confirm_password"
            placeholder="Confirm password"
            className="log-in-input"
          />
          <Button label="Sign Up" className="btn-login" />
          <p className="caption-text">
            By signing up, you agree to our{' '}
            <span
              role="button"
              tabIndex={0}
              onClick={() => {
                setOpen(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setOpen(true)
              }}
              className="sign-up-link"
            >
              {' '}
              terms & privacy policy
            </span>
          </p>
        </form>

        <Dialog open={open} onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
