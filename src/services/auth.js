import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password })
    return response.data
  },
  
  verifyToken: async (token) => {
    const response = await api.get('/admin/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },
  
  logout: () => {
    localStorage.removeItem('admin_token')
  }
}
