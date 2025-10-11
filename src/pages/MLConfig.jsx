import React, { useState, useEffect } from 'react'
import { Brain, Play, Pause, Settings, AlertTriangle } from 'lucide-react'
import { mlService } from '../services/api'
import MLFeatureToggle from '../components/ml/MLFeatureToggle'
import MLTrainingPanel from '../components/ml/MLTrainingPanel'
import MLModelsList from '../components/ml/MLModelsList'
import DataCollectionSettings from '../components/ml/DataCollectionSettings'

const ML_FEATURES = [
  {
    id: 'usage_prediction',
    name: 'Usage Prediction',
    description: 'Predict future API usage patterns and trends',
    benefits: ['Capacity planning', 'Resource optimization', 'Revenue forecasting']
  },
  {
    id: 'anomaly_detection',
    name: 'Anomaly Detection',
    description: 'Detect unusual patterns and potential issues in API usage',
    benefits: ['Fraud prevention', 'Service monitoring', 'Automatic alerts']
  },
  {
    id: 'pricing_optimization',
    name: 'Pricing Optimization',
    description: 'Optimize pricing strategies based on usage patterns and market data',
    benefits: ['Revenue maximization', 'Competitive pricing', 'Demand-based pricing']
  },
  {
    id: 'nlp_enhancement',
    name: 'NLP Enhancement',
    description: 'Improve natural language processing for billing rules with machine learning',
    benefits: ['Better parsing accuracy', 'Learning from corrections', 'Context understanding']
  }
]

export default function MLConfig() {
  const [mlConfig, setMlConfig] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)
  const [models, setModels] = useState({})
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)

  useEffect(() => {
    loadMLData()
  }, [])

  const loadMLData = async () => {
    try {
      const [configRes, statusRes, modelsRes] = await Promise.all([
        mlService.getMLConfig(),
        mlService.getMLStatus(),
        mlService.getMLModels()
      ])
      setMlConfig(configRes.data.ml_config)
      setMlStatus(statusRes.data)
      setModels(modelsRes.data.models)
    } catch (error) {
      console.error('Error loading ML data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleGlobal = async (enabled) => {
    try {
      if (enabled) {
        await mlService.enableMLGlobally()
      } else {
        await mlService.disableMLGlobally()
      }
      await loadMLData()
    } catch (error) {
      console.error('Error toggling ML:', error)
    }
  }

  const handleToggleFeature = async (featureId, enabled) => {
    try {
      if (enabled) {
        await mlService.enableFeature(featureId)
      } else {
        await mlService.disableFeature(featureId)
      }
      await loadMLData()
    } catch (error) {
      console.error('Error toggling feature:', error)
    }
  }

  const handleUpdateFeatureConfig = async (featureId, config) => {
    try {
      await mlService.updateFeatureConfig(featureId, config)
      await loadMLData()
    } catch (error) {
      console.error('Error updating feature config:', error)
    }
  }

  const handleManualTraining = async (features) => {
    setTraining(true)
    try {
      await mlService.triggerManualTraining(features)
      await loadMLData()
    } catch (error) {
      console.error('Error triggering training:', error)
    } finally {
      setTraining(false)
    }
  }

  const handleDataCollectionToggle = async (enabled, settings) => {
    try {
      if (enabled) {
        await mlService.enableDataCollection(settings)
      } else {
        await mlService.disableDataCollection()
      }
      await loadMLData()
    } catch (error) {
      console.error('Error toggling data collection:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const isMLEnabled = mlConfig?.global_enabled

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Machine Learning Configuration</h1>
          <p className="text-gray-600 mt-1">
            Configure AI-powered features for your API monetization platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isMLEnabled 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isMLEnabled ? 'ML Enabled' : 'ML Disabled'}
          </div>
          
          <button
            onClick={() => handleToggleGlobal(!isMLEnabled)}
            className={`px-4 py-2 rounded-md flex items-center ${
              isMLEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMLEnabled ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Disable ML
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Enable ML
              </>
            )}
          </button>
        </div>
      </div>

      {!isMLEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Machine Learning is Disabled
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Enable ML to access predictive analytics, anomaly detection, and pricing optimization features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ML Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ML_FEATURES.map((feature) => (
          <MLFeatureToggle
            key={feature.id}
            feature={feature}
            enabled={mlConfig?.features[feature.id]?.enabled || false}
            config={mlConfig?.features[feature.id] || {}}
            globalEnabled={isMLEnabled}
            onToggle={(enabled) => handleToggleFeature(feature.id, enabled)}
            onConfigUpdate={(config) => handleUpdateFeatureConfig(feature.id, config)}
          />
        ))}
      </div>

      {/* Data Collection Settings */}
      <DataCollectionSettings
        config={mlConfig?.data_collection || {}}
        enabled={isMLEnabled}
        onToggle={handleDataCollectionToggle}
      />

      {/* Training Panel */}
      <MLTrainingPanel
        mlStatus={mlStatus}
        enabled={isMLEnabled}
        onManualTraining={handleManualTraining}
        training={training}
      />

      {/* Models List */}
      <MLModelsList models={models} />
    </div>
  )
}
