import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Plus,
  Bot,
  User,
  Send,
  Trash2
} from 'lucide-react'

export default function FloatingChatWidget() {
  const { 
    chatState, 
    activeChat, 
    openChat, 
    closeChat, 
    toggleMinimize, 
    toggleFullScreen,
    sendMessage,
    clearConversation,
    setActiveChat
  } = useChat()

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat.messages])

  // Auto-open if there are unread messages
  useEffect(() => {
    if (chatState.unreadCount > 0 && chatState.isMinimized) {
      // You could add a notification effect here
    }
  }, [chatState.unreadCount, chatState.isMinimized])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || activeChat.isProcessing) return

    await sendMessage(inputMessage)
    setInputMessage('')
  }

  const handleQuickAction = (action, context = {}) => {
    const messages = {
      create_plan: "Help me create a new billing plan",
      analyze: "Analyze my current usage and suggest optimizations",
      troubleshoot: "I'm having issues with billing configuration"
    }
    sendMessage(messages[action], context)
  }

  if (!chatState.isOpen) return null

  if (chatState.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {/* Notification badge */}
        {chatState.unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
            {chatState.unreadCount}
          </div>
        )}
        
        <button
          onClick={toggleMinimize}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <div className={`
      fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200
      ${chatState.isFullScreen 
        ? 'inset-4 md:inset-20' 
        : 'bottom-4 right-4 w-96 h-[600px]'
      }
      flex flex-col
    `}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Billing Assistant</h3>
            <p className="text-blue-100 text-xs">
              {activeChat.isProcessing ? 'Thinking...' : 'Ready to help'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Clear chat */}
          <button
            onClick={clearConversation}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          
          {/* Minimize/Maximize */}
          <button
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullScreen}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {chatState.isFullScreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          
          {/* Close */}
          <button
            onClick={closeChat}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {activeChat.messages.length === 0 ? (
          <div className="text-center h-full flex items-center justify-center">
            <div className="text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Hello! I'm your billing assistant.</p>
              <p className="text-sm mt-1">How can I help you with billing today?</p>
              
              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => handleQuickAction('create_plan')}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Create Billing Plan</div>
                  <div className="text-sm text-gray-600">Help me set up new pricing</div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('analyze')}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Analyze Usage</div>
                  <div className="text-sm text-gray-600">Review patterns and suggest optimizations</div>
                </button>
                
                <button
                  onClick={() => handleQuickAction('troubleshoot')}
                  className="block w-full text-left p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">Troubleshoot Issues</div>
                  <div className="text-sm text-gray-600">Help with billing problems</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeChat.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 border border-red-200 text-red-800'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.type === 'user' ? (
                      <User className="h-3 w-3 mr-2" />
                    ) : (
                      <Bot className="h-3 w-3 mr-2" />
                    )}
                    <span className="text-xs font-medium">
                      {message.type === 'user' ? 'You' : 'Assistant'}
                    </span>
                    <span className="text-xs opacity-70 ml-2">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  
                  {/* Show confidence for bot messages with parsed billing */}
                  {message.type === 'bot' && message.parsedBilling && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          Confidence: <strong>{(message.confidence * 100).toFixed(1)}%</strong>
                        </span>
                        <button
                          onClick={() => {
                            // This would open a modal to create billing plan from parsed data
                            console.log('Create plan from:', message.parsedBilling)
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Create Plan
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Show next questions */}
                  {message.type === 'bot' && message.nextQuestions && message.nextQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-2">Suggested next steps:</p>
                      <div className="space-y-1">
                        {message.nextQuestions.map((question, index) => (
                          <button
                            key={index}
                            onClick={() => sendMessage(question)}
                            className="block w-full text-left text-xs text-blue-600 hover:text-blue-700 p-2 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {activeChat.isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-gray-400" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about billing, pricing, or plans..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={activeChat.isProcessing}
            />
          </div>
          <button
            type="submit"
            disabled={!inputMessage.trim() || activeChat.isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
