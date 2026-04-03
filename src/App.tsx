import { useEffect, useState } from 'react'
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
import { useLocation, useNavigate } from 'react-router'

function App() {

  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const { cart } = useAppSelector((state) => state.cart)
  const me = useAppSelector((state) => state.auth.me)
  const [isMeLoading, setIsMeLoading] = useState(false)

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
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark font-display antialiased">
      <main className="flex-1">
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
        />
        <Route
          path='/payment'
          element={
            !isLoggedIn ? (
              <Navigate to="/login" replace />
            ) : isMeLoading ? (
              <div className="min-h-screen bg-background-light dark:bg-background-dark" />
            ) : me == null ? (
              <Navigate to="/login" replace />
            ) : (
              <PaymentPage />
            )
          }
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
        <Route
          path='/orderstatus'
          element={
            !isLoggedIn ? (
              <Navigate to="/login" replace />
            ) : isMeLoading ? (
              <div className="min-h-screen bg-background-light dark:bg-background-dark" />
            ) : me == null ? (
              <Navigate to="/login" replace />
            ) : <PostPaymentPage />
          }
        />
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
        />
      </Routes>
      </main>
      {location.pathname !== '/login' ? (
        <footer className="border-t border-[#e6e0db] bg-white/95 px-4 py-3 text-xs font-medium text-text-light backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95 dark:text-zinc-400 text-center">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-4 sm:gap-6">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://gyor-jedlik.cms.intezmeny.edir.hu/uploads/GYSZC_Jedlik_Anyos_Technikum_GDPR_Adatkezelesi_es_adatvedelmi_szabalyzat_hatalyos_2022_01_01_tol_fca5c07ebb.pdf"
              className="transition-colors hover:text-text-dark dark:hover:text-zinc-200"
            >
              Adatkezelés
            </a>
            <button
              type="button"
              onClick={() => navigate('/main')}
              className="transition-colors hover:text-text-dark dark:hover:text-zinc-200"
            >
              Vissza a főoldalra
            </button>
            <button
              type="button"
              onClick={handleFooterLogout}
              className="transition-colors hover:text-text-dark dark:hover:text-zinc-200"
            >
              Kijelentkezés
            </button>
          </div>
          <br />
          <h1 className='text-lg'>{new Date().getFullYear()} BKM</h1>
        </footer>
      ) : null}
    </div>
  )
}

export default App
