import React, { createContext, useContext, useState, useCallback } from 'react'
import { nlpService } from '../services/api'

const ChatContext = createContext()

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}

export function ChatProvider({ children }) {
  const [chatState, setChatState] = useState({
    isOpen: false,
    isMinimized: false,
    isFullScreen: false,
    currentConversationId: null,
    conversations: {},
    unreadCount: 0,
    isLoading: false
  })

  const [activeChat, setActiveChat] = useState({
    messages: [],
    currentInput: '',
    isProcessing: false
  })

  // Open chat in different modes
  const openChat = useCallback((mode = 'minimized') => {
    setChatState(prev => ({
      ...prev,
      isOpen: true,
      isMinimized: mode === 'minimized',
      isFullScreen: mode === 'fullscreen'
    }))
  }, [])

  const closeChat = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isOpen: false,
      isMinimized: false,
      isFullScreen: false
    }))
  }, [])

  const toggleMinimize = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isMinimized: !prev.isMinimized,
      isFullScreen: false
    }))
  }, [])

  const toggleFullScreen = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      isFullScreen: !prev.isFullScreen,
      isMinimized: false
    }))
  }, [])

  // Send message to NLP service
  const sendMessage = useCallback(async (message, context = {}) => {
    if (!message.trim()) return

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    }

    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isProcessing: true
    }))

    try {
      // Send to NLP service
      const response = await nlpService.chatWithAssistant({
        message,
        conversation_id: chatState.currentConversationId,
        context
      })

      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        parsedBilling: response.data.parsed_billing,
        confidence: response.data.confidence,
        nextQuestions: response.data.next_questions,
        timestamp: new Date()
      }

      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isProcessing: false
      }))

      // Update conversation ID if this is a new conversation
      if (!chatState.currentConversationId) {
        setChatState(prev => ({
          ...prev,
          currentConversationId: response.data.conversation_id
        }))
      }

      // Increment unread count if minimized
      if (chatState.isMinimized) {
        setChatState(prev => ({
          ...prev,
          unreadCount: prev.unreadCount + 1
        }))
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isProcessing: false
      }))
    }
  }, [chatState.currentConversationId, chatState.isMinimized])

  // Quick actions for billing scenarios
  const quickAction = useCallback((actionType, context = {}) => {
    const quickMessages = {
      create_billing: "I want to create a new billing plan. Can you help me set it up?",
      modify_billing: "I need to modify an existing billing plan.",
      analyze_usage: "Can you analyze my API usage patterns and suggest optimizations?",
      pricing_advice: "I need advice on pricing strategy for my APIs.",
      troubleshoot: "I'm having issues with my billing configuration."
    }

    const message = quickMessages[actionType] || "Hello, I need help with billing."
    sendMessage(message, context)
    openChat('minimized')
  }, [sendMessage, openChat])

  // Clear conversation
  const clearConversation = useCallback(async () => {
    if (chatState.currentConversationId) {
      try {
        await nlpService.clearConversation(chatState.currentConversationId)
      } catch (error) {
        console.error('Error clearing conversation:', error)
      }
    }

    setActiveChat({
      messages: [],
      currentInput: '',
      isProcessing: false
    })

    setChatState(prev => ({
      ...prev,
      currentConversationId: null,
      unreadCount: 0
    }))
  }, [chatState.currentConversationId])

  const value = {
    // State
    chatState,
    activeChat,
    
    // Actions
    openChat,
    closeChat,
    toggleMinimize,
    toggleFullScreen,
    sendMessage,
    quickAction,
    clearConversation,
    
    // Setters
    setActiveChat: (updater) => {
      if (typeof updater === 'function') {
        setActiveChat(prev => updater(prev))
      } else {
        setActiveChat(updater)
      }
    }
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
