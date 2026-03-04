import './App.css'
import MainPage from './pages/MainPage'
import { useAppSelector } from './store/hooks'
import LoginPage from './pages/LoginPage'
import { Provider } from 'react-redux'
import { store } from './store/store'

function AppContent() {
  const { isLoggedIn } = useAppSelector((state) => state.auth)

  return isLoggedIn ? <MainPage /> : <LoginPage />
}

function App() {

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
