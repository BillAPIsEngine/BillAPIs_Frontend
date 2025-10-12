import React, { useState } from 'react'
import { Filter, X, ChevronDown, Calendar, DollarSign, Users } from 'lucide-react'

const FILTER_OPTIONS = {
  status: [
    { value: 'active', label: 'Active', count: 0 },
    { value: 'inactive', label: 'Inactive', count: 0 },
    { value: 'draft', label: 'Draft', count: 0 }
  ],
  connector: [
    { value: 'kong', label: 'Kong', count: 0 },
    { value: 'wso2', label: 'WSO2', count: 0 },
    { value: 'aws', label: 'AWS', count: 0 },
    { value: 'azure', label: 'Azure', count: 0 }
  ],
  billing_type: [
    { value: 'per_request', label: 'Per Request', count: 0 },
    { value: 'tiered', label: 'Tiered', count: 0 },
    { value: 'subscription', label: 'Subscription', count: 0 },
    { value: 'freemium', label: 'Freemium', count: 0 }
  ],
  date_range: [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
    { value: 'custom', label: 'Custom range' }
  ]
}

export default function AdvancedFilters({ onFiltersChange, availableFilters = Object.keys(FILTER_OPTIONS) }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [openDropdown, setOpenDropdown] = useState(null)

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...activeFilters }
    
    if (checked) {
      if (!newFilters[filterType]) {
        newFilters[filterType] = []
      }
      newFilters[filterType].push(value)
    } else {
      newFilters[filterType] = newFilters[filterType]?.filter(v => v !== value) || []
      if (newFilters[filterType].length === 0) {
        delete newFilters[filterType]
      }
    }
    
    setActiveFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const removeFilter = (filterType, value) => {
    handleFilterChange(filterType, value, false)
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    onFiltersChange({})
  }

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'date_range': return Calendar
      case 'billing_type': return DollarSign
      case 'connector': return Users
      default: return Filter
    }
  }

  const activeFilterCount = Object.values(activeFilters).reduce((count, values) => count + values.length, 0)

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className="h-4 w-4" />
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-40 w-80">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filters</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {availableFilters.map(filterType => {
              const Icon = getFilterIcon(filterType)
              const options = FILTER_OPTIONS[filterType] || []
              const isDropdownOpen = openDropdown === filterType

              return (
                <div key={filterType} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => setOpenDropdown(isDropdownOpen ? null : filterType)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-700 capitalize">
                        {filterType.replace('_', ' ')}
                      </span>
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="px-4 pb-4 space-y-2">
                      {options.map(option => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeFilters[filterType]?.includes(option.value) || false}
                            onChange={(e) => handleFilterChange(filterType, option.value, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{option.label}</span>
                          {option.count !== undefined && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {option.count}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="p-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([filterType, values]) =>
                  values.map(value => {
                    const option = FILTER_OPTIONS[filterType]?.find(opt => opt.value === value)
                    return (
                      <span
                        key={`${filterType}-${value}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {option?.label || value}
                        <button
                          onClick={() => removeFilter(filterType, value)}
                          className="ml-1 hover:text-blue-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
