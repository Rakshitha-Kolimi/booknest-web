import {
  AdminBooks,
  AdminOrders,
  BookDetail,
  Books,
  Cart,
  ForgotPassword,
  Home,
  Login,
  NotFound,
  Orders,
  Profile,
  Register,
  ResetPassword,
  ResetSuccessful,
  UnAuthorized,
  VerifyEmail,
} from '@booknest/pages'
import { Header } from '@booknest/ui'
import { Logout } from '@booknest/ui'
import { PrivateRoute, PublicRoute, RoleBasedRoute } from '@booknest/ui-helpers'
import { clearAuthSession, getRole } from '@booknest/utils'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import {
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { GlobalSearch } from './GlobalSearch'

export default function App() {
  const location = useLocation()
  const role = getRole()
  const isAuthenticated = Boolean(role)
  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/reset-successful' ||
    location.pathname === '/verify-email'

  const navigate = useNavigate()

  const onLogout = () => {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className="bn-shell">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: '12px',
            background: '#18181b',
            color: '#fafafa',
          },
        }}
        containerStyle={{ top: 88, right: 16 }}
      />
      {!isAuthPage && (
        <header className="bn-header sticky top-0 z-20">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <Header />
            {isAuthenticated && <GlobalSearch />}
            {isAuthenticated && (
              <nav className="flex items-center gap-4">
                <NavLink to="/" className="app-link">
                  Home
                </NavLink>
                <NavLink to="/books" className="app-link">
                  Books
                </NavLink>
                {role === 'ADMIN' ? (
                  <>
                    <NavLink to="/admin/manage" className="app-link">
                      Manage
                    </NavLink>
                    <NavLink to="/admin/orders" className="app-link">
                      Admin Orders
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/cart" className="app-link">
                      Cart
                    </NavLink>
                    <NavLink to="/orders" className="app-link">
                      Orders
                    </NavLink>
                  </>
                )}
                <NavLink to="/profile" className="app-link">
                  Profile
                </NavLink>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center rounded-full p-1 transition hover:bg-orange-100"
                  aria-label="Logout"
                >
                  <Logout width="2rem" height="2rem" />
                </button>
              </nav>
            )}
          </div>
        </header>
      )}

      <main
        className={
          isAuthPage ? '' : 'bn-main mx-auto w-full max-w-7xl px-4 py-8'
        }
      >
        <div className={isAuthPage ? '' : 'space-y-2'}>
          <Routes>
            <Route
              path="/login"
              element={<PublicRoute element={<Login />} />}
            />
            <Route
              path="/register"
              element={<PublicRoute element={<Register />} />}
            />
            <Route
              path="/forgot-password"
              element={<PublicRoute element={<ForgotPassword />} />}
            />
            <Route
              path="/reset-successful"
              element={<PublicRoute element={<ResetSuccessful />} />}
            />
            <Route
              path="/reset-password"
              element={<PublicRoute element={<ResetPassword />} />}
            />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/" element={<PrivateRoute element={<Home />} />} />
            <Route
              path="/books"
              element={<PrivateRoute element={<Books />} />}
            />
            <Route
              path="/books/:id"
              element={<PrivateRoute element={<BookDetail />} />}
            />
            <Route
              path="/cart"
              element={
                <RoleBasedRoute element={<Cart />} allowedRoles={['USER']} />
              }
            />
            <Route
              path="/orders"
              element={
                <RoleBasedRoute element={<Orders />} allowedRoles={['USER']} />
              }
            />
            <Route
              path="/admin/manage"
              element={
                <RoleBasedRoute
                  element={<AdminBooks />}
                  allowedRoles={['ADMIN']}
                />
              }
            />
            <Route
              path="/admin/books"
              element={
                <RoleBasedRoute
                  element={<AdminBooks />}
                  allowedRoles={['ADMIN']}
                />
              }
            />
            <Route
              path="/admin/orders"
              element={
                <RoleBasedRoute
                  element={<AdminOrders />}
                  allowedRoles={['ADMIN']}
                />
              }
            />
            <Route
              path="/profile"
              element={<PrivateRoute element={<Profile />} />}
            />
            <Route path="/unauthorized" element={<UnAuthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
