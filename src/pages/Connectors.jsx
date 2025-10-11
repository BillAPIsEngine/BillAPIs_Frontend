import React, { useState, useEffect } from 'react'
import { Plus, RefreshCw, Settings, Trash2 } from 'lucide-react'
import { connectorService } from '../services/api'
import ConnectorModal from '../components/connectors/ConnectorModal'
import HybridSourceModal from '../components/connectors/HybridSourceModal'
import APITable from '../components/connectors/APITable'

const API_MANAGERS = [
  { value: 'kong', label: 'Kong API Gateway' },
  { value: 'wso2', label: 'WSO2 API Manager' },
  { value: 'aws', label: 'AWS API Gateway' },
  { value: 'azure', label: 'Azure API Management' },
  { value: 'apigee', label: 'Apigee' },
]

const ANALYTICS_TOOLS = [
  { value: 'elk', label: 'ELK Stack' },
  { value: 'grafana', label: 'Grafana' },
  { value: 'prometheus', label: 'Prometheus' },
  { value: 'datadog', label: 'Datadog' },
]

export default function Connectors() {
  const [connectors, setConnectors] = useState([])
  const [hybridSources, setHybridSources] = useState([])
  const [apis, setApis] = useState([])
  const [showConnectorModal, setShowConnectorModal] = useState(false)
  const [showHybridModal, setShowHybridModal] = useState(false)
  const [selectedConnector, setSelectedConnector] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(null)

  useEffect(() => {
    loadConnectors()
  }, [])

  const loadConnectors = async () => {
    try {
      const [connectorsRes, hybridRes, apisRes] = await Promise.all([
        connectorService.getConnectors(),
        connectorService.getHybridSources(),
        connectorService.getAPIs()
      ])
      setConnectors(connectorsRes.data.connectors)
      setHybridSources(hybridRes.data.hybrid_sources)
      setApis(apisRes.data.apis)
    } catch (error) {
      console.error('Error loading connectors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (sourceId, type = 'connector') => {
    setSyncing(sourceId)
    try {
      if (type === 'hybrid') {
        await connectorService.syncHybridSource(sourceId)
      } else {
        await connectorService.importAPIs(sourceId)
      }
      await loadConnectors()
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(null)
    }
  }

  const handleAddConnector = async (data) => {
    try {
      await connectorService.registerConnector(data)
      setShowConnectorModal(false)
      await loadConnectors()
    } catch (error) {
      console.error('Error adding connector:', error)
    }
  }

  const handleAddHybridSource = async (data) => {
    try {
      await connectorService.registerHybridSource(data)
      setShowHybridModal(false)
      await loadConnectors()
    } catch (error) {
      console.error('Error adding hybrid source:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">API Connectors</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowHybridModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hybrid Source
          </button>
          <button
            onClick={() => setShowConnectorModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Connector
          </button>
        </div>
      </div>

      {/* Hybrid Sources Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hybrid Data Sources</h2>
          <p className="text-sm text-gray-600 mt-1">
            Combine API managers with analytics tools for comprehensive data
          </p>
        </div>
        
        <div className="p-6">
          {hybridSources.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hybrid sources configured</p>
              <button
                onClick={() => setShowHybridModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first hybrid source
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {hybridSources.map((source) => (
                <div key={source.source_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h3 className="font-medium text-gray-900">{source.name}</h3>
                        <p className="text-sm text-gray-500">
                          {source.api_manager} + {source.analytics_tool}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSync(source.source_id, 'hybrid')}
                      disabled={syncing === source.source_id}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing === source.source_id ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Standard Connectors Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">API Manager Connectors</h2>
          <p className="text-sm text-gray-600 mt-1">
            Direct connections to API management platforms
          </p>
        </div>
        
        <div className="p-6">
          {connectors.length === 0 ? (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No connectors configured</p>
              <button
                onClick={() => setShowConnectorModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                Add your first connector
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {connectors.map((connector) => (
                <div key={connector.connector_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        connector.is_active ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {API_MANAGERS.find(m => m.value === connector.connector_type)?.label || connector.connector_type}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Last sync: {connector.last_sync ? new Date(connector.last_sync).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSync(connector.connector_type)}
                      disabled={syncing === connector.connector_type}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-4 w-4 ${syncing === connector.connector_type ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Imported APIs Section */}
      <APITable apis={apis} />

      {/* Modals */}
      {showConnectorModal && (
        <ConnectorModal
          apiManagers={API_MANAGERS}
          onClose={() => setShowConnectorModal(false)}
          onSubmit={handleAddConnector}
        />
      )}

      {showHybridModal && (
        <HybridSourceModal
          apiManagers={API_MANAGERS}
          analyticsTools={ANALYTICS_TOOLS}
          onClose={() => setShowHybridModal(false)}
          onSubmit={handleAddHybridSource}
        />
      )}
    </div>
  )
}
