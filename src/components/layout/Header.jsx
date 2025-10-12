import React from 'react'
import { Menu, Bell, MessageCircle } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'
import GlobalSearch from '../search/GlobalSearch'

export default function Header({ onMenuClick }) {
  const { openChat, chatState } = useChat()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Global Search */}
          <div className="ml-4 lg:ml-6">
            <GlobalSearch />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Chat Assistant Button */}
          <button 
            onClick={() => openChat('minimized')}
            className="relative p-2 rounded-md text-gray-400 hover:text-blue-600 transition-colors"
            title="Billing Assistant"
          >
            <MessageCircle className="h-6 w-6" />
            {chatState.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {chatState.unreadCount}
              </div>
            )}
          </button>
          
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-500">
            <Bell className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
