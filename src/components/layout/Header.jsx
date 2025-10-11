import React from 'react'
import { Menu, Bell, Search, MessageCircle } from 'lucide-react'
import { useChat } from '../../contexts/ChatContext'

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
          
          <div className="relative ml-4 lg:ml-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
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
          
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </header>
  )
}
