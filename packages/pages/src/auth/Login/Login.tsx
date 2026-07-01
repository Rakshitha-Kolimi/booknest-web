import '../common/index.css'

import { getErrorMessage } from '@booknest/services'
import { Button, Header } from '@booknest/ui'
import { syncAuthSessionWithRefresh } from '@booknest/utils'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { usePageTitle } from '../../PageTitleProvider'
import { useLoginMutation } from '../../query/hooks'

export default function Login(): React.ReactElement {
  // Initialise navigation before setting up form and query state.
  const navigate = useNavigate()
  usePageTitle('Login')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Call query functions after local form state is ready.
  const loginMutation = useLoginMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const response = await loginMutation.mutateAsync({
        email: formData.email.trim(),
        password: formData.password,
      })
      syncAuthSessionWithRefresh(response.access_token, response.refresh_token)

      toast.success('Logged in successfully!')
      navigate('/')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Login failed. Please try again.'))
    }
  }

  return (
    <div className="form">
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
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
            value={formData.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="log-in-input"
            value={formData.password}
            onChange={handleChange}
          />
          <Link className="forgot-password-text" to="/forgot-password">
            Forgot Password?
          </Link>
          <Button
            label={loginMutation.isPending ? 'Logging in' : 'Login'}
            className="btn-login"
            disabled={loginMutation.isPending}
          />
        </form>
      </div>
    </div>
  )
}
