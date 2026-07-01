import '../common/index.css'

import { AuthService, getErrorMessage } from '@booknest/services'
import { Button, Header } from '@booknest/ui'
import { DefaultCountryCode } from '@booknest/utils'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'

import { usePageTitle } from '../../PageTitleProvider'
import { useRegisterMutation } from '../../query/hooks'
import Dialog from './Terms&Privacy/Terms&Privacy'

export default function Register(): React.ReactElement {
  const navigate = useNavigate()
  usePageTitle('Register')

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
    password: '',
    confirm_password: '',
  })
  const registerMutation = useRegisterMutation()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match')
      return
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    try {
      const mobileWithCountryCode = DefaultCountryCode + formData.mobile

      await registerMutation.mutateAsync({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        mobile: mobileWithCountryCode,
        password: formData.password,
        role: AuthService.UserRoleType.User,
      })

      toast.success('Account created successfully! Redirecting to login...')
      navigate('/login')
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Registration failed. Please try again.')
      )
    }
  }

  return (
    <div className="form">
      <div className="form-container">
        <form className="form" onSubmit={handleSubmit}>
          <Header className="login-logo" />
          <h3 className="log-in-text">Create Account</h3>
          <p className="sign-up-text">
            Already have an account?{' '}
            <Link to="/login" className="sign-up-link">
              Log in
            </Link>
          </p>

          <input
            name="first_name"
            type="text"
            placeholder="First name"
            value={formData.first_name}
            onChange={handleChange}
            className="log-in-input"
            required
          />
          <input
            name="last_name"
            type="text"
            placeholder="Last name"
            value={formData.last_name}
            onChange={handleChange}
            className="log-in-input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="log-in-input"
            required
          />
          <input
            name="mobile"
            type="mobile"
            placeholder="Mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="log-in-input"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="log-in-input"
            required
          />
          <input
            name="confirm_password"
            type="password"
            placeholder="Confirm password"
            value={formData.confirm_password}
            onChange={handleChange}
            className="log-in-input"
            required
          />
          <Button
            label={registerMutation.isPending ? 'Signing Up...' : 'Sign Up'}
            className="btn-login"
            type="submit"
            disabled={registerMutation.isPending}
          />

          <p className="caption-text">
            By signing up, you agree to our{' '}
            <span
              role="button"
              tabIndex={0}
              onClick={() => setOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setOpen(true)
              }}
              className="sign-up-link"
            >
              terms & privacy policy
            </span>
          </p>
        </form>

        <Dialog open={open} onClose={() => setOpen(false)} />
      </div>
    </div>
  )
}
