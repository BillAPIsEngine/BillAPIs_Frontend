import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AppProvider } from './contexts/AppContext'
import { ChatProvider } from './contexts/ChatContext'
import { SearchProvider } from './contexts/SearchContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Connectors from './pages/Connectors'
import Billing from './pages/Billing'
import Analytics from './pages/Analytics'
import Consumers from './pages/Consumers'
import MLConfig from './pages/MLConfig'
import ChatPage from './pages/ChatPage'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/connectors" element={<Connectors />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/consumers" element={<Consumers />} />
        <Route path="/ml-config" element={<MLConfig />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <SearchProvider>
          <ChatProvider>
            <AppContent />
          </ChatProvider>
        </SearchProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
