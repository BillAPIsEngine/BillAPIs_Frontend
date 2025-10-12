import React, { useState, useEffect } from 'react'
import { 
  Package, 
  Users, 
  CreditCard, 
  Plus, 
  Filter, 
  Search,
  Layers,
  UserCheck,
  Api
} from 'lucide-react'
import { billingService, connectorService, consumerService } from '../services/api'
import APIProductCreator from '../components/billing/APIProductCreator'
import BillingAssignmentManager from '../components/billing/BillingAssignmentManager'
import ConsumerOverrideManager from '../components/billing/ConsumerOverrideManager'

const BILLING_LEVELS = [
  { value: 'api', label: 'API Level', description: 'Apply to specific APIs', icon: Api },
  { value: 'consumer', label: 'Consumer Level', description: 'Apply to specific consumers', icon: Users },
  { value: 'product', label: 'API Product Level', description: 'Apply to API bundles', icon: Package }
]

export default function ConsumerBillingManager() {
  const [activeTab, setActiveTab] = useState('products')
  const [data, setData] = useState({
    apiProducts: [],
    billingAssignments: [],
    consumerOverrides: [],
    apis: [],
    billingPlans: [],
    consumers: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, assignmentsRes, overridesRes, apisRes, plansRes, consumersRes] = await Promise.all([
        billingService.getConsumerProducts(),
        billingService.getBillingAssignments(),
        billingService.getConsumerOverrides(),
        connectorService.getAPIs(),
        billingService.getBillingPlans(),
        consumerService.getConsumers()
      ])

      setData({
        apiProducts: productsRes.data,
        billingAssignments: assignmentsRes.data,
        consumerOverrides: overridesRes.data,
        apis: apisRes.data.apis,
        billingPlans: plansRes.data,
        consumers: consumersRes.data.consumers
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600 mt-1">Create API products and manage billing assignments</p>
        </div>
      </div>

      {/* Billing Level Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BILLING_LEVELS.map(level => {
          const Icon = level.icon
          const count = level.value === 'api' ? data.billingAssignments.filter(a => a.target_type === 'api').length :
                       level.value === 'consumer' ? data.billingAssignments.filter(a => a.target_type === 'consumer').length :
                       data.billingAssignments.filter(a => a.target_type === 'api_product').length

          return (
            <div key={level.value} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{level.label}</h3>
                  <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-2xl font-bold text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">active assignments</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'products', label: 'API Products', icon: Package },
              { id: 'assignments', label: 'Billing Assignments', icon: CreditCard },
              { id: 'overrides', label: 'Consumer Overrides', icon: UserCheck }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'products' && data.apiProducts.length > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                      {data.apiProducts.length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'products' && (
            <APIProductCreator
              products={data.apiProducts}
              apis={data.apis}
              onProductCreated={loadData}
            />
          )}
          
          {activeTab === 'assignments' && (
            <BillingAssignmentManager
              assignments={data.billingAssignments}
              billingPlans={data.billingPlans}
              apis={data.apis}
              apiProducts={data.apiProducts}
              consumers={data.consumers}
              onAssignmentCreated={loadData}
            />
          )}
          
          {activeTab === 'overrides' && (
            <ConsumerOverrideManager
              overrides={data.consumerOverrides}
              billingPlans={data.billingPlans}
              consumers={data.consumers}
              onOverrideCreated={loadData}
            />
          )}
        </div>
      </div>
    </div>
  )
}
