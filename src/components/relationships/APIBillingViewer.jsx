import React, { useState, useEffect } from 'react'
import { Link, Search, Filter, Eye, Edit, Users, CreditCard, BarChart3 } from 'lucide-react'
import { connectorService, billingService, consumerService } from '../../services/api'
import AdvancedFilters from '../filters/AdvancedFilters'

export default function APIBillingViewer() {
  const [data, setData] = useState({
    apis: [],
    billingPlans: [],
    consumers: [],
    assignments: []
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [selectedView, setSelectedView] = useState('matrix') // matrix, list, relationships

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [apisRes, plansRes, consumersRes] = await Promise.all([
        connectorService.getAPIs(),
        billingService.getBillingPlans(),
        consumerService.getConsumers()
      ])

      setData({
        apis: apisRes.data.apis,
        billingPlans: plansRes.data,
        consumers: consumersRes.data.consumers,
        assignments: [] // This would come from a separate API
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter and search logic
  const filteredData = React.useMemo(() => {
    let filtered = { ...data }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered.apis = filtered.apis.filter(api =>
        api.name.toLowerCase().includes(query) ||
        api.api_id.toLowerCase().includes(query) ||
        api.base_path?.toLowerCase().includes(query)
      )
      filtered.billingPlans = filtered.billingPlans.filter(plan =>
        plan.name.toLowerCase().includes(query) ||
        plan.description?.toLowerCase().includes(query)
      )
      filtered.consumers = filtered.consumers.filter(consumer =>
        consumer.name.toLowerCase().includes(query) ||
        consumer.email.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.connector) {
      filtered.apis = filtered.apis.filter(api =>
        filters.connector.includes(api.connector_type)
      )
    }
    if (filters.status) {
      filtered.apis = filtered.apis.filter(api =>
        filters.status.includes(api.is_active ? 'active' : 'inactive')
      )
      filtered.billingPlans = filtered.billingPlans.filter(plan =>
        filters.status.includes(plan.is_active ? 'active' : 'inactive')
      )
      filtered.consumers = filtered.consumers.filter(consumer =>
        filters.status.includes(consumer.is_active ? 'active' : 'inactive')
      )
    }

    return filtered
  }, [data, searchQuery, filters])

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
          <h1 className="text-2xl font-bold text-gray-900">API & Billing Relationships</h1>
          <p className="text-gray-600 mt-1">View connections between APIs, billing plans, and consumers</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Link className="h-4 w-4 mr-2" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search APIs, plans, consumers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <AdvancedFilters
              onFiltersChange={setFilters}
              availableFilters={['connector', 'status', 'billing_type']}
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'matrix', label: 'Matrix', icon: BarChart3 },
              { key: 'list', label: 'List', icon: Users },
              { key: 'relationships', label: 'Relationships', icon: CreditCard }
            ].map(view => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <view.icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={BarChart3}
          label="Total APIs"
          value={filteredData.apis.length}
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Billing Plans"
          value={filteredData.billingPlans.length}
          color="green"
        />
        <StatCard
          icon={Users}
          label="Consumers"
          value={filteredData.consumers.length}
          color="purple"
        />
        <StatCard
          icon={Link}
          label="Active Assignments"
          value={filteredData.assignments.length}
          color="orange"
        />
      </div>

      {/* Content based on selected view */}
      <div className="bg-white rounded-lg border border-gray-200">
        {selectedView === 'matrix' && (
          <MatrixView data={filteredData} />
        )}
        {selectedView === 'list' && (
          <ListView data={filteredData} />
        )}
        {selectedView === 'relationships' && (
          <RelationshipView data={filteredData} />
        )}
      </div>
    </div>
  )
}

function MatrixView({ data }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">API-Billing Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-3 border-b">API</th>
              {data.billingPlans.map(plan => (
                <th key={plan.plan_id} className="text-center p-3 border-b">
                  <div className="flex flex-col items-center">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-gray-500">{plan.plan_id}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.apis.map(api => (
              <tr key={api.api_id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-gray-500">{api.base_path}</p>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {api.connector_type}
                    </span>
                  </div>
                </td>
                {data.billingPlans.map(plan => (
                  <td key={plan.plan_id} className="text-center p-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm">
                      Assign
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ListView({ data }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed List</h3>
      <div className="space-y-4">
        {data.apis.map(api => (
          <div key={api.api_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{api.name}</h4>
                  <p className="text-sm text-gray-600">{api.base_path}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {api.connector_type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      api.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {api.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <Eye className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Assigned Billing Plans */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Billing Plans</h5>
              <div className="flex flex-wrap gap-2">
                {data.billingPlans.slice(0, 3).map(plan => (
                  <span
                    key={plan.plan_id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800"
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    {plan.name}
                  </span>
                ))}
                {data.billingPlans.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{data.billingPlans.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Relationship
