import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Brain, Wand2, CheckCircle } from 'lucide-react'
import { billingService } from '../../services/api'

const NLP_PROVIDERS = [
  { value: 'openai', label: 'OpenAI GPT-4' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'anthropic', label: 'Anthropic Claude' },
]

export default function NLPBillingAssistant({ onClose, onSubmit }) {
  const [parsing, setParsing] = useState(false)
  const [parsedResult, setParsedResult] = useState(null)
  const [validationResult, setValidationResult] = useState(null)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const description = watch('description')

  const handleParse = async (data) => {
    setParsing(true)
    try {
      const parseResult = await billingService.parseBillingIntent({
        text: data.description,
        nlp_provider: data.nlp_provider
      })
      
      setParsedResult(parseResult.data)

      // Validate the parsed logic
      const validation = await billingService.validateBillingLogic(parseResult.data.billing_logic)
      setValidationResult(validation.data)
    } catch (error) {
      console.error('Error parsing billing intent:', error)
    } finally {
      setParsing(false)
    }
  }

  const handleCreate = () => {
    if (parsedResult && validationResult?.is_valid) {
      onSubmit({
        name: watch('name'),
        description: watch('description'),
        nlp_provider: watch('nlp_provider'),
        parsed_result: parsedResult
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">AI Billing Assistant</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Describe your billing rules in natural language and let AI create the plan
          </p>
        </div>

        <form onSubmit={handleSubmit(handleParse)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Plan name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g., Basic API Plan"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NLP Provider
            </label>
            <select
              {...register('nlp_provider', { required: 'NLP provider is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {NLP_PROVIDERS.map(provider => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Description
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Describe your billing rules in natural language. Example: 'Charge $0.01 per API request, with the first 1000 requests free each month. Give 20% volume discount for over 1 million requests.'"
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {!parsedResult ? (
                <button
                  type="submit"
                  disabled={parsing || !description}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 flex items-center"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  {parsing ? 'Parsing...' : 'Parse with AI'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!validationResult?.is_valid}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Plan
                </button>
              )}
            </div>
          </div>
        </form>

        {parsedResult && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Parsed Billing Logic</h3>
            
            {validationResult && (
              <div className={`p-3 rounded-md mb-4 ${
                validationResult.is_valid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center">
                  <CheckCircle className={`h-4 w-4 mr-2 ${
                    validationResult.is_valid ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    validationResult.is_valid ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {validationResult.is_valid ? 'Valid billing logic' : 'Validation issues found'}
                  </span>
                </div>
                
                {validationResult.issues.length > 0 && (
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                    {validationResult.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
                
                {validationResult.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-800">Suggestions:</p>
                    <ul className="text-sm text-green-700 list-disc list-inside">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white p-4 rounded-md border border-gray-200">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(parsedResult.billing_logic, null, 2)}
              </pre>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <p>Confidence: {(parsedResult.confidence * 100).toFixed(1)}%</p>
              <p>Intent: {parsedResult.intent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
