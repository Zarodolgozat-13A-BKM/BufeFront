import { useEffect, useState } from 'react'
import MainPage from './pages/MainPage'
import { useAppDispatch, useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import AdminPage from './pages/AdminPage'
import { Navigate, Route, Routes } from 'react-router'
import { applyInitialTheme } from './services/themeService'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { GetMe } from './services/APIservice'
import { logout, setMe } from './store/authSlice'

function App() {
  const dispatch = useAppDispatch()
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const { cart } = useAppSelector((state) => state.cart)
  const me = useAppSelector((state) => state.auth.me)
  const [isMeLoading, setIsMeLoading] = useState(false)

  useEffect(() => {
    applyInitialTheme()
  }, [])

  useEffect(() => {
    if (!isLoggedIn || me) {
      setIsMeLoading(false)
      return
    }

    let isCancelled = false
    setIsMeLoading(true)

    const bootstrapMe = async () => {
      try {
        const user = await GetMe()
        if (!isCancelled) {
          dispatch(setMe({ me: user }))
        }
      } catch (error) {
        console.error('Failed to bootstrap current user:', error)
        if (!isCancelled) {
          dispatch(logout())
        }
      } finally {
        if (!isCancelled) {
          setIsMeLoading(false)
        }
      }
    }

    bootstrapMe()

    return () => {
      isCancelled = true
    }
  }, [isLoggedIn, me, dispatch])

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/main" replace /> : <LoginPage />}
      />
      <Route
        path="/main"
        element={isLoggedIn ? <MainPage /> : <Navigate to="/login" replace />}
        />
        
      <Route
        path="/me"
        element={isLoggedIn ? <ProfilePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/checkout"
        element={
          isLoggedIn
            ? (cart.items.length > 0 ? <CheckoutPage /> : <Navigate to="/main" replace />)
            : <Navigate to="/login" replace />
        }
      />
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
        />
      <Route
        path="/admin"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isMeLoading ? (
            <div className="min-h-screen bg-background-light dark:bg-background-dark" />
          ) : me == null ? (
            <Navigate to="/login" replace />
          ) : me.role === 'admin' ? (
            <AdminPage />
          ) : (
            <Navigate to="/me" replace />
          )
        }
      />
      <Route
      path='/orders'
              element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : isMeLoading ? (
            <div className="min-h-screen bg-background-light dark:bg-background-dark" />
          ) : me == null ? (
            <Navigate to="/login" replace />
          ) : me.role === 'admin' ? (
            <AdminOrdersPage />
          ) : (
            <Navigate to="/me" replace />
          )
        }
        />
    </Routes>
  )
}

export default App
