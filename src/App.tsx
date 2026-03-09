import './App.css'
import MainPage from './pages/MainPage'
import { useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import CheckoutPage from './pages/CheckoutPage'
import { Navigate, Route, Routes } from 'react-router'

function App() {
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const { cart } = useAppSelector((state) => state.cart)

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
    </Routes>
  )
}

export default App
