import React, { useState, useRef, useEffect } from 'react'
import { useChat } from '../contexts/ChatContext'
import { 
  Bot, 
  User, 
  Send, 
  Trash2, 
  Download,
  Upload,
  MessageCircle,
  ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ChatPage() {
  const { 
    activeChat, 
    sendMessage, 
    clearConversation,
    setActiveChat
  } = useChat()

  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat.messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || activeChat.isProcessing) return

    await sendMessage(inputMessage, { page_context: 'fullscreen_chat' })
    setInputMessage('')
  }

  const handleQuickAction = (action) => {
    const messages = {
      pricing_strategy: "I need help developing a pricing strategy for my APIs. What factors should I consider?",
      usage_analysis: "Can you analyze my current API usage patterns and suggest billing optimizations?",
      competitor_analysis: "How does my current pricing compare to competitors? What adjustments should I make?",
      billing_models: "Explain the different billing models available and which would work best for my use case."
    }
    sendMessage(messages[action], { page_context: 'fullscreen_chat' })
  }

  const exportConversation = () => {
    const conversationData = {
      timestamp: new Date().toISOString(),
      messages: activeChat.messages
    }
    
    const blob = new Blob([JSON.stringify(conversationData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `billing-assistant-conversation-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Billing Assistant</h1>
                  <p className="text-sm text-gray-600">AI-powered billing guidance and support</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={exportConversation}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                disabled={activeChat.messages.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button
                onClick={clearConversation}
                className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700"
                disabled={activeChat.messages.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Quick Actions Bar */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { 
                  key: 'pricing_strategy', 
                  label: 'Pricing Strategy', 
                  description: 'Get pricing recommendations' 
                },
                { 
                  key: 'usage_analysis', 
                  label: 'Usage Analysis', 
                  description: 'Analyze usage patterns' 
                },
                { 
                  key: 'competitor_analysis', 
                  label: 'Competitor Analysis', 
                  description: 'Compare with competitors' 
                },
                { 
                  key: 'billing_models', 
                  label: 'Billing Models', 
                  description: 'Explore pricing models' 
                }
              ].map((action) => (
                <button
                  key={action.key}
                  onClick={() => handleQuickAction(action.key)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                >
                  <div className="font-medium text-gray-900 group-hover:text-blue-700">
                    {action.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
            {activeChat.messages.length === 0 ? (
              <div className="text-center h-full flex items-center justify-center">
                <div className="max-w-md">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Welcome to Billing Assistant
                  </h3>
                  <p className="text-gray-600 mb-6">
                    I can help you with pricing strategies, billing plan creation, usage analysis, 
                    and optimization recommendations. What would you like to discuss?
                  </p>
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
                      className={`max-w-3xl rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.type === 'error'
                          ? 'bg-red-50 border border-red-200 text-red-800'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center mb-3">
                        {message.type === 'user' ? (
                          <User className="h-5 w-5 mr-3" />
                        ) : (
                          <Bot className="h-5 w-5 mr-3" />
                        )}
                        <div>
                          <span className="font-medium">
                            {message.type === 'user' ? 'You' : 'Billing Assistant'}
                          </span>
                          <span className="text-sm opacity-70 ml-3">
                            {message.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Parsed billing data */}
                      {message.type === 'bot' && message.parsedBilling && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm text-gray-700">
                              Detected Billing Rules
                            </span>
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              {(message.confidence * 100).toFixed(1)}% confidence
                            </span>
                          </div>
                          <pre className="text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(message.parsedBilling, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {/* Next questions */}
                      {message.type === 'bot' && message.nextQuestions && message.nextQuestions.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Follow-up questions:
                          </p>
                          <div className="space-y-2">
                            {message.nextQuestions.map((question, index) => (
                              <button
                                key={index}
                                onClick={() => sendMessage(question, { page_context: 'fullscreen_chat' })}
                                className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
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
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-3xl">
                      <div className="flex items-center space-x-3">
                        <Bot className="h-5 w-5 text-gray-400" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask about billing strategies, plan creation, usage analysis..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  disabled={activeChat.isProcessing}
                />
              </div>
              <button
                type="submit"
                disabled={!inputMessage.trim() || activeChat.isProcessing}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg font-medium"
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
