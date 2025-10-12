import { useState, useEffect } from 'react'
import { authService } from '../services/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      if (token) {
        const userData = await authService.verifyToken(token)
        setUser(userData)
      }
    } catch (error) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { user: userData, token } = await authService.login(email, password)
    setUser(userData)
    return userData
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return {
    user,
    login,
    logout,
    loading
  }
}
