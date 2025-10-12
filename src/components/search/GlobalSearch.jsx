import React, { useState, useEffect, useRef } from 'react'
import { Search, X, ArrowRight, FileText, Users, CreditCard, BarChart3 } from 'lucide-react'
import { useSearch } from '../../contexts/SearchContext'
import { connectorService, billingService, consumerService } from '../../services/api'

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState('')
  const [searchResults, setSearchResults] = useState({
    apis: [],
    billingPlans: [],
    consumers: [],
    isLoading: false
  })
  const [activeCategory, setActiveCategory] = useState('all')
  const searchInputRef = useRef(null)

  const { searchState, updateGlobalQuery } = useSearch()

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!localQuery.trim()) {
        setSearchResults({ apis: [], billingPlans: [], consumers: [], isLoading: false })
        return
      }

      setSearchResults(prev => ({ ...prev, isLoading: true }))

      try {
        const [apisRes, plansRes, consumersRes] = await Promise.all([
          connectorService.getAPIs(),
          billingService.getBillingPlans(),
          consumerService.getConsumers()
        ])

        const query = localQuery.toLowerCase()
        
        const filteredApis = apisRes.data.apis.filter(api => 
          api.name.toLowerCase().includes(query) ||
          api.api_id.toLowerCase().includes(query) ||
          api.description?.toLowerCase().includes(query) ||
          api.base_path?.toLowerCase().includes(query)
        )

        const filteredPlans = plansRes.data.filter(plan =>
          plan.name.toLowerCase().includes(query) ||
          plan.description?.toLowerCase().includes(query) ||
          plan.plan_id.toLowerCase().includes(query)
        )

        const filteredConsumers = consumersRes.data.consumers.filter(consumer =>
          consumer.name.toLowerCase().includes(query) ||
          consumer.email.toLowerCase().includes(query) ||
          consumer.consumer_id.toLowerCase().includes(query)
        )

        setSearchResults({
          apis: filteredApis,
          billingPlans: filteredPlans,
          consumers: filteredConsumers,
          isLoading: false
        })

      } catch (error) {
        console.error('Search error:', error)
        setSearchResults(prev => ({ ...prev, isLoading: false }))
      }
    }

    const debounceTimer = setTimeout(performSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [localQuery])

  const handleResultClick = (type, item) => {
    console.log(`Navigate to ${type}:`, item)
    setIsOpen(false)
    setLocalQuery('')
    // Here you would navigate to the specific detail page
  }

  const categories = [
    { key: 'all', label: 'All', icon: Search, count: searchResults.apis.length + searchResults.billingPlans.length + searchResults.consumers.length },
    { key: 'apis', label: 'APIs', icon: FileText, count: searchResults.apis.length },
    { key: 'plans', label: 'Billing Plans', icon: CreditCard, count: searchResults.billingPlans.length },
    { key: 'consumers', label: 'Consumers', icon: Users, count: searchResults.consumers.length }
  ]

  const displayResults = activeCategory === 'all' ? [
    ...searchResults.apis.map(item => ({ ...item, type: 'api' })),
    ...searchResults.billingPlans.map(item => ({ ...item, type: 'billing_plan' })),
    ...searchResults.consumers.map(item => ({ ...item, type: 'consumer' }))
  ] : activeCategory === 'apis' ? searchResults.apis.map(item => ({ ...item, type: 'api' })) :
     activeCategory === 'plans' ? searchResults.billingPlans.map(item => ({ ...item, type: 'billing_plan' })) :
     searchResults.consumers.map(item => ({ ...item, type: 'consumer' }))

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors w-64 justify-between"
      >
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Search...</span>
        </div>
        <kbd className="text-xs bg-white border border-gray-300 rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] flex flex-col">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder="Search APIs, billing plans, consumers..."
                  className="w-full pl-10 pr-4 py-3 border-0 focus:outline-none focus:ring-0 text-lg"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex px-4 space-x-6">
                {categories.map(category => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`py-3 border-b-2 transition-colors ${
                      activeCategory === category.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                      {category.count > 0 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchResults.isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Searching...
                </div>
              ) : localQuery.trim() && displayResults.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No results found for "{localQuery}"</p>
                  <p className="text-sm mt-1">Try different keywords or check the spelling</p>
                </div>
              ) : !localQuery.trim() ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start typing to search across APIs, billing plans, and consumers</p>
                  <div className="mt-6 grid grid-cols-3 gap-4 text-left">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-medium">APIs</p>
                      <p className="text-sm text-gray-600">Search by name, ID, or path</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <CreditCard className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-medium">Billing Plans</p>
                      <p className="text-sm text-gray-600">Search by plan name or description</p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-medium">Consumers</p>
                      <p className="text-sm text-gray-600">Search by name or email</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {displayResults.map((item, index) => (
                    <SearchResultItem
                      key={`${item.type}-${item.id || item.api_id || item.plan_id || item.consumer_id}`}
                      item={item}
                      onClick={() => handleResultClick(item.type, item)}
                      isHighlighted={index === 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between">
              <span>Use ↑↓ to navigate, ↵ to select, ESC to close</span>
              <span>{displayResults.length} results</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SearchResultItem({ item, onClick, isHighlighted }) {
  const getIcon = (type) => {
    switch (type) {
      case 'api': return FileText
      case 'billing_plan': return CreditCard
      case 'consumer': return Users
      default: return FileText
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'api': return 'text-blue-600 bg-blue-50'
      case 'billing_plan': return 'text-green-600 bg-green-50'
      case 'consumer': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const Icon = getIcon(item.type)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
        isHighlighted ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getTypeColor(item.type)}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {item.name || item.api_id || item.plan_id}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {item.type === 'api' && item.base_path && `Path: ${item.base_path}`}
              {item.type === 'billing_plan' && item.description}
              {item.type === 'consumer' && item.email}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                {item.type.replace('_', ' ')}
              </span>
              {item.connector_type && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                  {item.connector_type}
                </span>
              )}
              {item.is_active !== undefined && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    </button>
  )
}
