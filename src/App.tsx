import { useEffect, useState, type ReactElement } from 'react'
import MainPage from './pages/MainPage'
import { useAppDispatch, useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { CheckoutPage } from './pages/CheckoutPage'
import AdminPage from './pages/AdminPage'
import { Navigate, Route, Routes } from 'react-router'
import { applyInitialTheme } from './services/themeService'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { GetMe, Logout as ApiLogout } from './services/APIservice'
import { logout, setMe } from './store/authSlice'
import PaymentPage from './pages/PaymentPage'
import PostPaymentPage from './pages/PostPaymentPage'
import AdminPosPage from './pages/AdminPosPage'
import { useLocation, useNavigate } from 'react-router'

function App() {

  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const me = useAppSelector((state) => state.auth.me)
  const [isMeLoading, setIsMeLoading] = useState(false)
  const authLoadingFallback = <div className="min-h-screen bg-secondary dark:bg-secondary-dark" />

  const requireLogin = (element: ReactElement) => {
    return isLoggedIn ? element : <Navigate to="/login" replace />
  }

  const requireHydratedUser = (element: ReactElement) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />
    }
    if (isMeLoading) {
      return authLoadingFallback
    }
    if (me == null) {
      return <Navigate to="/login" replace />
    }
    return element
  }

  const requireAdmin = (element: ReactElement) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />
    }
    if (isMeLoading) {
      return authLoadingFallback
    }
    if (me == null) {
      return <Navigate to="/login" replace />
    }
    if (me.role !== 'admin') {
      return <Navigate to="/me" replace />
    }
    return element
  }

  const handleFooterLogout = async () => {
    try {
      await ApiLogout()
    } catch (error) {
      console.warn('API logout failed, continuing to clear local state', error)
    } finally {
      localStorage.clear()
      dispatch(logout())
      navigate('/login', { replace: true })
    }
  }

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
    <div className="flex min-h-screen flex-col bg-surface dark:bg-secondary-dark font-display antialiased">
      <main className="flex-1">
        <Routes>
          <Route
            path='/payment'
            element={requireHydratedUser(<PaymentPage />)}
          />
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/main" replace /> : <LoginPage />}
          />
          <Route
            path="/main"
            element={requireLogin(<MainPage />)}
          />

          <Route
            path="/me"
            element={requireHydratedUser(me?.role !== 'admin' ? <ProfilePage /> : <Navigate to="/admin" replace />)}
          />
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
          />
          <Route
            path="/cart"
            element={requireLogin(<CheckoutPage />)}
          />
          <Route
            path="/admin"
            element={requireAdmin(<AdminPage />)}
          />
          <Route
            path='/admin/orders'
            element={requireAdmin(<AdminOrdersPage />)}
          />
          <Route
            path='/admin/pos'
            element={requireAdmin(<AdminPosPage />)}
          />
          <Route
            path='/orderstatus'
            element={requireHydratedUser(me?.role === 'admin' ? <AdminOrdersPage /> : <PostPaymentPage />)}
          />
          <Route
            path="*"
            element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
          />
        </Routes>
      </main>
      {location.pathname !== '/login' ? (
        <footer className="border-t border-[#e6e0db] bg-surface dark:bg-zinc-900/95 px-4 py-3 text-xs font-medium text-muted backdrop-blur dark:border-zinc-800 dark:text-zinc-400 text-center">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 sm:gap-6">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://gyor-jedlik.cms.intezmeny.edir.hu/uploads/GYSZC_Jedlik_Anyos_Technikum_GDPR_Adatkezelesi_es_adatvedelmi_szabalyzat_hatalyos_2022_01_01_tol_fca5c07ebb.pdf"
              className="transition-colors hover:text-foreground dark:hover:text-zinc-200"
            >
              Adatkezelés
            </a>
            <button
              type="button"
              onClick={() => navigate('/main')}
              className="transition-colors hover:text-foreground dark:hover:text-zinc-200"
            >
              Vissza a főoldalra
            </button>
            <button
              type="button"
              onClick={handleFooterLogout}
              className="transition-colors hover:text-foreground dark:hover:text-zinc-200"
            >
              Kijelentkezés
            </button>
          </div>
          <br />
          <h1>{new Date().getFullYear()} BKM - Jedlik</h1>
        </footer>
      ) : null}
    </div>
  )
}

export default App