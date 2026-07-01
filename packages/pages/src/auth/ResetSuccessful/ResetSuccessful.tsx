import '../common/index.css'

import { Button, Header } from '@booknest/ui'
import React from 'react'

import { usePageTitle } from '../../PageTitleProvider'

export default function ResetSuccessful(): React.ReactElement {
  usePageTitle('Password Reset Successful')

  /**
   * Render success message
   */
  return (
    <div className="form">
      <div className="form-container">
        <div className="form">
          <Header className="login-logo" />

          <h3 className="log-in-text">Password Reset Link Sent!</h3>
          <p className="sign-up-text">
            Please check your email inbox for further instructions to reset your
            password.
          </p>

          <Button
            label="Back to Login"
            className="btn-login"
            onClick={() => {
              window.location.href = '/login'
            }}
          />
        </div>
      </div>
    </div>
  )
}
