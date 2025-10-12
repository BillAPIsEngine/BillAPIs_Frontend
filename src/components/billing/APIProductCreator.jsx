import React, { useState } from 'react'
import { Plus, X, Package, Search, Check } from 'lucide-react'
import { billingService } from '../../services/api'

export default function APIProductCreator({ products, apis, onProductCreated }) {
  const [isCreating, setIsCreating] = useState(false)
  const [selectedAPIs, setSelectedAPIs] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const filteredAPIs = apis.filter(api =>
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.api_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.base_path?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateProduct = async () => {
    if (!formData.name || selectedAPIs.length === 0) return

    try {
      await billingService.createAPIProduct({
        name: formData.name,
        description: formData.description,
        apis: selectedAPIs.map(api => api.api_id)
      })

      setIsCreating(false)
      setSelectedAPIs([])
      setFormData({ name: '', description: '' })
      onProductCreated()
    } catch (error) {
      console.error('Error creating API product:', error)
    }
  }

  const toggleAPI = (api) => {
    setSelectedAPIs(prev =>
      prev.some(a => a.api_id === api.api_id)
        ? prev.filter(a => a.api_id !== api.api_id)
        : [...prev, api]
    )
  }

  if (!isCreating) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Products</h2>
            <p className="text-gray-600">Bundle multiple APIs into products with shared billing</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Product</span>
          </button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No API products yet</h3>
            <p className="text-gray-600 mb-6">Create your first API product to bundle multiple APIs</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.product_id} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                <div className="flex items-center space-x-3 mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Included APIs</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.apis.slice(0, 3).map(apiId => {
                        const api = apis.find(a => a.api_id === apiId)
                        return api ? (
                          <span key={apiId} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {api.name}
                          </span>
                        ) : null
                      })}
                      {product.apis.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                          +{product.apis.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-2 py-1 rounded-full ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-gray-500">
                      {product.apis.length} API{product.apis.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Create API Product</h2>
        <button
          onClick={() => setIsCreating(false)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Enterprise API Bundle"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe this API product bundle..."
          />
        </div>
      </div>

      {/* API Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select APIs to Include *
        </label>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search APIs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Selected APIs */}
        {selectedAPIs.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected APIs ({selectedAPIs.length})</p>
            <div className="flex flex-wrap gap-2">
              {selectedAPIs.map(api => (
                <span
                  key={api.api_id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {api.name}
                  <button
                    onClick={() => toggleAPI(api)}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available APIs */}
        <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
          {filteredAPIs.map(api => (
            <button
              key={api.api_id}
              onClick={() => toggleAPI(api)}
              className={`w-full flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                selectedAPIs.some(a => a.api_id === api.api_id) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                  selectedAPIs.some(a => a.api_id === api.api_id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedAPIs.some(a => a.api_id === api.api_id) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{api.name}</p>
                  <p className="text-sm text-gray-600">{api.base_path}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                {api.connector_type}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={() => setIsCreating(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateProduct}
          disabled={!formData.name || selectedAPIs.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Product
        </button>
      </div>
    </div>
  )
}
