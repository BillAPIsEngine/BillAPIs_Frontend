import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
