import React, { useState, useEffect } from 'react'
import { useChat } from '../../contexts/ChatContext'
import { 
  Package, 
  Users, 
  Api, 
  CreditCard, 
  Layers,
  CheckCircle,
  AlertTriangle,
  Brain
} from 'lucide-react'
import { nlpService, connectorService, consumerService, billingService } from '../../services/api'

export default function MultiLevelBillingChat() {
  const { activeChat, sendMessage, setActiveChat } = useChat()
  const [billingContext, setBillingContext] = useState({})
  const [parsedConfig, setParsedConfig] = useState(null)
  const [validationResult, setValidationResult] = useState(null)

  // Load context for NLP
  useEffect(() => {
    loadBillingContext()
  }, [])

  const loadBillingContext = async () => {
    try {
      const [apisRes, consumersRes, productsRes, plansRes] = await Promise.all([
        connectorService.getAPIs(),
        consumerService.getConsumers(),
        billingService.getConsumerProducts(),
        billingService.getBillingPlans()
      ])

      setBillingContext({
        available_apis: apisRes.data.apis,
        available_consumers: consumersRes.data.consumers,
        available_products: productsRes.data,
        available_plans: plansRes.data
      })
    } catch (error) {
      console.error('Error loading billing context:', error)
    }
  }

  const handleComplexBillingMessage = async (message) => {
    // Send user message
    await sendMessage(message)

    // Parse with enhanced NLP
    try {
      const parseResult = await nlpService.parseComplexBillingIntent({
        text: message,
        context: billingContext
      })

      setParsedConfig(parseResult.data)

      // Validate the configuration
      const validation = await nlpService.validateBillingConfiguration(parseResult.data)
      setValidationResult(validation.data)

      // Create bot response based on parsing results
      let botResponse = this._createBillingResponse(parseResult.data, validation.data)
      
      // Send the analysis as a bot message
      await sendMessage(botResponse)

    } catch (error) {
      console.error('Error processing billing message:', error)
      await sendMessage("I encountered an error analyzing your billing configuration. Please try again.")
    }
  }

  const _createBillingResponse = (parsedData, validation) => {
    const confidence = parsedData.confidence
    const intent = parsedData.primary_intent
    const actions = parsedData.actions || []

    if (confidence < 0.6) {
      return `I'm not very confident about this configuration (${(confidence * 100).toFixed(1)}% confidence).\n\nCould you clarify:\n${parsedData.clarification_questions?.map(q => `• ${q}`).join('\n')}`
    }

    let response = `✅ I understand your billing configuration with ${(confidence * 100).toFixed(1)}% confidence.\n\n`

    // Describe detected actions
    response += "**Detected Actions:**\n"
    actions.forEach((action, index) => {
      response += `${index + 1}. ${this._describeAction(action)}\n`
    })

    // Add validation results
    if (!validation.is_valid) {
      response += `\n⚠️ **Validation Issues:**\n${validation.issues?.map(issue => `• ${issue}`).join('\n')}`
    }

    if (validation.suggestions?.length > 0) {
      response += `\n💡 **Suggestions:**\n${validation.suggestions?.map(suggestion => `• ${suggestion}`).join('\n')}`
    }

    response += `\n\nWould you like to:\n• **Create these billing rules**\n• **Modify the configuration**\n• **Discuss alternatives**`

    return response
  }

  const _describeAction = (action) => {
    const type = action.action_type
    const target = action.target_name
    const rules = action.billing_rules || []

    if (type === 'create_api_product') {
      return `Create API product "${target}" with ${rules.length} billing rule(s)`
    } else if (type === 'assign_billing') {
      return `Assign billing to ${action.target_type} "${target}"`
    } else if (type === 'create_override') {
      return `Create billing override for ${action.target_type} "${target}"`
    }

    return `Configure ${action.target_type} "${target}"`
  }

  const executeBillingConfiguration = async () => {
    if (!parsedConfig) return

    try {
      // Execute each detected action
      for (const action of parsedConfig.actions) {
        await _executeBillingAction(action)
      }

      await sendMessage("✅ Successfully created all billing configurations!")
      setParsedConfig(null)
      setValidationResult(null)

    } catch (error) {
      console.error('Error executing billing configuration:', error)
      await sendMessage("❌ Failed to create some billing configurations. Please check the details.")
    }
  }

  const _executeBillingAction = async (action) => {
    switch (action.action_type) {
      case 'create_api_product':
        await billingService.createAPIProduct({
          name: action.target_name,
          description: `Created via NLP: ${action.metadata?.notes || 'AI-generated product'}`,
          apis: action.apis || [],
          metadata: {
            created_via_nlp: true,
            nlp_confidence: parsedConfig.confidence,
            original_intent: parsedConfig.primary_intent
          }
        })
        break

      case 'assign_billing':
        await billingService.createBillingAssignment({
          billing_plan_id: action.billing_rules[0]?.metadata?.plan_id || await _createBillingPlanFromRules(action.billing_rules),
          target_type: action.target_type,
          target_id: action.target_id,
          effective_date: action.metadata?.effective_date || new Date().toISOString().split('T')[0],
          metadata: {
            created_via_nlp: true,
            nlp_confidence: parsedConfig.confidence
          }
        })
        break

      case 'create_override':
        await billingService.createConsumerOverride({
          target_consumer_id: action.target_id,
          billing_plan_id: await _createBillingPlanFromRules(action.billing_rules),
          conditions: action.billing_rules[0]?.conditions || {},
          metadata: {
            created_via_nlp: true
          }
        })
        break
    }
  }

  const _createBillingPlanFromRules = async (rules) => {
    // Create a billing plan from NLP-parsed rules
    const planResponse = await billingService.createBillingPlan({
      name: `AI-Generated Plan ${new Date().getTime()}`,
      description: 'Created via natural language processing',
      rules: rules,
      is_active: true,
      metadata: {
        created_via_nlp: true,
        nlp_rules: rules
      }
    })
    
    return planResponse.data.plan_id
  }

  return (
    <div className="space-y-4">
      {/* Billing Context Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Brain className="h-5 w-5 text-blue-600" />
          <div>
            <p className="font-medium text-blue-900">Billing Assistant Ready</p>
            <p className="text-sm text-blue-700">
              I understand API products, consumer overrides, and multi-level billing
            </p>
          </div>
        </div>
      </div>

      {/* Parsed Configuration Preview */}
      {parsedConfig && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">Configuration Preview</h4>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                parsedConfig.confidence > 0.7 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {(parsedConfig.confidence * 100).toFixed(1)}% confidence
              </span>
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-2">
            {parsedConfig.actions.map((action, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-white rounded border">
                {action.action_type === 'create_api_product' && <Package className="h-4 w-4 text-blue-600" />}
                {action.action_type === 'assign_billing' && <CreditCard className="h-4 w-4 text-green-600" />}
                {action.action_type === 'create_override' && <Users className="h-4 w-4 text-purple-600" />}
                
                <div className="flex-1">
                  <p className="font-medium text-sm">{action.target_name}</p>
                  <p className="text-xs text-gray-600 capitalize">
                    {action.action_type.replace(/_/g, ' ')} • {action.target_type}
                  </p>
                </div>
                
                {action.confidence_match === false && (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className={`mt-3 p-3 rounded border ${
              validationResult.is_valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-2">
                {validationResult.is_valid ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="font-medium text-sm">
                  {validationResult.is_valid ? 'Configuration Valid' : 'Needs Review'}
                </span>
              </div>
              
              {validationResult.issues?.length > 0 && (
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  {validationResult.issues.map((issue, idx) => (
                    <li key={idx}>{issue}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={executeBillingConfiguration}
              disabled={validationResult && !validationResult.is_valid}
              className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Configuration
            </button>
            <button
              onClick={() => {
                setParsedConfig(null)
                setValidationResult(null)
              }}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Modify
            </button>
          </div>
        </div>
      )}

      {/* Quick Billing Examples */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Try examples:</p>
        <div className="space-y-2">
          {[
            "Create a product 'Starter Pack' with API A and B, charge $0.01 per request",
            "For enterprise customers, set subscription pricing at $500/month for all APIs",
            "Give startup customers first 10,000 requests free on the Analytics API",
            "Create tiered pricing: 0-1M requests at $0.01, 1M+ at $0.005"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => handleComplexBillingMessage(example)}
              className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 p-2 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
