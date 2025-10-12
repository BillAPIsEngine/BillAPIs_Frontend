import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const addNotification = (notification) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, ...notification }])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const value = {
    notifications,
    addNotification,
    removeNotification,
    loading,
    setLoading
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}
