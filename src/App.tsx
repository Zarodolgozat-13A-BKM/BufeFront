import './App.css'
import MainPage from './pages/MainPage'
import { useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Navigate, Route, Routes } from 'react-router'

function App() {
  const { isLoggedIn } = useAppSelector((state) => state.auth)

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
        path="*"
        element={<Navigate to={isLoggedIn ? '/main' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
