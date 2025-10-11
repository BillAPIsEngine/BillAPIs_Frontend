import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Brain, Wand2, CheckCircle, MessageCircle, User, Bot } from 'lucide-react'
import { billingService } from '../../services/api'

const NLP_PROVIDERS = [
  { value: 'openai', label: 'OpenAI GPT-4' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'anthropic', label: 'Anthropic Claude' },
]

// Conversation message types
const MESSAGE_TYPES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system'
}

export default function NLPBillingAssistant({ onClose, onSubmit }) {
  const [conversation, setConversation] = useState([])
  const [parsing, setParsing] = useState(false)
  const [parsedResult, setParsedResult] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const [currentStep, setCurrentStep] = useState('welcome')
  const messagesEndRef = useRef(null)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm()

  const description = watch('description')

  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])

  // Initialize conversation
  useEffect(() => {
    const welcomeMessage = {
      type: MESSAGE_TYPES.BOT,
      content: `Hello! I'm your billing assistant. I can help you create billing plans using natural language. 

For example, you can say things like:
• "Charge $0.01 per API request"
• "First 1000 requests free each month, then $0.005 per request"
• "Tiered pricing: 0-10K requests free, 10K-100K at $0.01, 100K+ at $0.005"
• "Monthly subscription of $99 for up to 1M requests"

What kind of billing plan would you like to create?`,
      timestamp: new Date()
    }
    setConversation([welcomeMessage])
  }, [])

  const addMessage = (type, content) => {
    const message = {
      type,
      content,
      timestamp: new Date()
    }
    setConversation(prev => [...prev, message])
  }

  const handleUserMessage = async (data) => {
    const userMessage = data.message || data.description
    if (!userMessage.trim()) return

    // Add user message to conversation
    addMessage(MESSAGE_TYPES.USER, userMessage)
    setParsing(true)

    try {
      // Show typing indicator
      addMessage(MESSAGE_TYPES.BOT, "🤔 Analyzing your billing description...")

      // Parse the billing intent using selected NLP provider
      const parseResult = await billingService.parseBillingIntent({
        text: userMessage,
        nlp_provider: data.nlp_provider || 'openai',
        context: {
          conversation_history: conversation.slice(-4), // Last 4 messages for context
          current_step: currentStep
        }
      })

      // Remove typing indicator and add actual response
      setConversation(prev => prev.slice(0, -1))
      
      const parsedData = parseResult.data
      setParsedResult(parsedData)

      // Validate the parsed logic
      const validation = await billingService.validateBillingLogic(parsedData.billing_logic)
      setValidationResult(validation.data)

      // Create bot response based on parsing results
      let botResponse = ''
      
      if (parsedData.confidence > 0.8) {
        botResponse = `✅ Great! I understood your billing rules with ${(parsedData.confidence * 100).toFixed(1)}% confidence.

**Detected Billing Type:** ${parsedData.intent}
**Rules Created:** ${parsedData.billing_logic.length} rule(s)

${
  validation.data.is_valid 
    ? '✅ The billing logic looks valid and ready to use!'
    : `⚠️ I found some issues:\n${validation.data.issues.map(issue => `• ${issue}`).join('\n')}`
}

${validation.data.suggestions.length > 0 ? `💡 Suggestions:\n${validation.data.suggestions.map(suggestion => `• ${suggestion}`).join('\n')}` : ''}

Would you like to:
1. Create this billing plan
2. Modify the rules
3. Start over?`
      } else {
        botResponse = `🤔 I'm only ${(parsedData.confidence * 100).toFixed(1)}% confident about this. 

Could you clarify:
• The exact pricing structure?
• Any free tiers or volume discounts?
• The billing period (monthly, per request, etc.)?`
      }

      addMessage(MESSAGE_TYPES.BOT, botResponse)
      setCurrentStep('review')

      // Auto-fill the form if confidence is high
      if (parsedData.confidence > 0.8 && !watch('name')) {
        setValue('name', `Auto-${parsedData.intent}-Plan`)
        setValue('description', userMessage)
      }

    } catch (error) {
      console.error('Error parsing billing intent:', error)
      setConversation(prev => prev.slice(0, -1))
      addMessage(MESSAGE_TYPES.BOT, "❌ Sorry, I encountered an error processing your request. Please try again or rephrase your billing description.")
    } finally {
      setParsing(false)
    }
  }

  const handleQuickAction = (action) => {
    const quickMessages = {
      'per_request': "I want to charge per API request. For example: $0.01 per request with no monthly fees.",
      'tiered': "I want tiered pricing. For example: first 1000 requests free, then $0.01 per request up to 10K, then $0.005 beyond that.",
      'subscription': "I want a monthly subscription model. For example: $99 per month for up to 1 million requests.",
      'freemium': "I want a freemium model. For example: free tier with 1000 requests/month, then paid plans starting at $10/month."
    }

    addMessage(MESSAGE_TYPES.USER, quickMessages[action])
    handleUserMessage({ message: quickMessages[action], nlp_provider: watch('nlp_provider') })
  }

  const handleCreatePlan = () => {
    if (parsedResult && validationResult?.is_valid) {
      onSubmit({
        name: watch('name') || `AI-${parsedResult.intent}-Plan`,
        description: watch('description') || conversation.find(m => m.type === MESSAGE_TYPES.USER)?.content,
        nlp_provider: watch('nlp_provider'),
        parsed_result: parsedResult
      })
    }
  }

  const handleModifyRequest = (modification) => {
    addMessage(MESSAGE_TYPES.USER, modification)
    handleUserMessage({ message: modification, nlp_provider: watch('nlp_provider') })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 mr-2" />
              <div>
                <h2 className="text-lg font-semibold">AI Billing Assistant</h2>
                <p className="text-purple-100 text-sm">
                  Describe your billing rules in plain English
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {conversation.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === MESSAGE_TYPES.USER ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.type === MESSAGE_TYPES.USER
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.type === MESSAGE_TYPES.USER ? (
                        <User className="h-4 w-4 mr-2" />
                      ) : (
                        <Bot className="h-4 w-4 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {message.type === MESSAGE_TYPES.USER ? 'You' : 'Billing Assistant'}
                      </span>
                      <span className="text-xs opacity-70 ml-2">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  </div>
                </div>
              ))}
              
              {parsing && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-[80%]">
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-gray-400" />
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
            </div>

            {/* Quick Actions */}
            {conversation.length === 1 && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <p className="text-sm text-gray-600 mb-3">Quick start:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'per_request', label: 'Per-Request Pricing' },
                    { key: 'tiered', label: 'Tiered Pricing' },
                    { key: 'subscription', label: 'Subscription' },
                    { key: 'freemium', label: 'Freemium Model' }
                  ].map((action) => (
                    <button
                      key={action.key}
                      onClick={() => handleQuickAction(action.key)}
                      className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">{action.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSubmit(handleUserMessage)} className="flex space-x-3">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register('message')}
                    placeholder="Describe your billing rules... (e.g., 'Charge $0.01 per request with first 1000 free monthly')"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={parsing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={parsing}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send
                </button>
              </form>

              {/* NLP Provider Selection */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">AI Model:</span>
                  <select
                    {...register('nlp_provider')}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {NLP_PROVIDERS.map(provider => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {parsedResult && (
                  <div className="text-sm text-gray-600">
                    Confidence: <span className="font-medium">{(parsedResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Plan Details Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto">
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Plan Details</h3>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="input-field"
                    placeholder="e.g., Basic API Plan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows="3"
                    className="input-field"
                    placeholder="Billing description..."
                  />
                </div>
              </form>

              {parsedResult && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Parsed Rules</h4>
                  
                  {validationResult && (
                    <div className={`p-3 rounded-md mb-3 ${
                      validationResult.is_valid 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center">
                        {validationResult.is_valid ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        ) : (
                          <Wand2 className="h-4 w-4 text-yellow-600 mr-2" />
                        )}
                        <span className={`text-sm font-medium ${
                          validationResult.is_valid ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {validationResult.is_valid ? 'Valid' : 'Needs Review'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-3 rounded-md border">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(parsedResult.billing_logic, null, 2)}
                    </pre>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleCreatePlan}
                      disabled={!validationResult?.is_valid}
                      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Create Billing Plan
                    </button>
                    
                    <button
                      onClick={() => handleModifyRequest("Can you make the pricing more competitive?")}
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
                    >
                      Modify Pricing
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
