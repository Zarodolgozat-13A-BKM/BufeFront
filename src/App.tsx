import { useEffect } from 'react'
import './App.css'
import MainPage from './pages/MainPage'
import { useAppDispatch, useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import { login } from './store/authSlice'
import { Navigate, Route, Routes } from 'react-router-dom'


function App() {
  const { isLoggedIn } = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  useEffect(() => {
    const token = getCookie('token')
    console.log('Token from cookie:', token)
    if (token && !isLoggedIn) {
      dispatch(login({ token, username: '' }))
    }
    console.log('isLoggedIn:', isLoggedIn)
  }, [dispatch, isLoggedIn])

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={isLoggedIn ? <MainPage /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={isLoggedIn ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App
