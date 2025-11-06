import { Button } from '@booknest/ui'
import React, { useEffect } from 'react'

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
    <div className="prose">
      <h2>Login to BookNest</h2>
      <Button label="Login" className="btn-login" />
    </div>
  )
}
