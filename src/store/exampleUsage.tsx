// Example usage of Redux auth state in components

import { useAppSelector, useAppDispatch } from '../store/hooks'
import { logout } from '../store/authSlice'

export const ExampleComponent = () => {
  const dispatch = useAppDispatch()
  const { isLoggedIn, bearerToken } = useAppSelector((state) => state.auth)

  const handleLogout = () => {
    // Dispatch logout action to clear Redux state
    dispatch(logout())
    
    // Also call API logout if needed
    // await Logout()
  }

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>Logged in!</p>
          <p>Token: {bearerToken?.substring(0, 20)}...</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Not logged in</p>
      )}
    </div>
  )
}
