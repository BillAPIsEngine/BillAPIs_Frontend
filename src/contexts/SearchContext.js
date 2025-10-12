import React, { createContext, useContext, useState, useMemo } from 'react'

const SearchContext = createContext()

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}

export function SearchProvider({ children }) {
  const [searchState, setSearchState] = useState({
    globalQuery: '',
    activeFilters: {},
    currentView: null,
    searchResults: {
      apis: [],
      billingPlans: [],
      consumers: [],
      usageRecords: []
    }
  })

  const updateGlobalQuery = (query) => {
    setSearchState(prev => ({
      ...prev,
      globalQuery: query
    }))
  }

  const updateFilters = (filters) => {
    setSearchState(prev => ({
      ...prev,
      activeFilters: { ...prev.activeFilters, ...filters }
    }))
  }

  const clearFilters = () => {
    setSearchState(prev => ({
      ...prev,
      activeFilters: {},
      globalQuery: ''
    }))
  }

  const setSearchResults = (type, results) => {
    setSearchState(prev => ({
      ...prev,
      searchResults: {
        ...prev.searchResults,
        [type]: results
      }
    }))
  }

  const value = {
    searchState,
    updateGlobalQuery,
    updateFilters,
    clearFilters,
    setSearchResults
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}
