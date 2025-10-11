import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const connectorService = {
  getConnectors: () => api.get('/admin/connectors'),
  registerConnector: (data) => api.post('/admin/connectors', data),
  importAPIs: (connectorType) => api.post(`/admin/apis/import?connector_type=${connectorType}`),
  getAPIs: (connectorType) => api.get(`/admin/apis?connector_type=${connectorType}`),
  
  // Hybrid sources
  registerHybridSource: (data) => api.post('/admin/hybrid-sources', data),
  getHybridSources: () => api.get('/admin/hybrid-sources'),
  syncHybridSource: (sourceId) => api.post(`/admin/hybrid-sources/${sourceId}/sync`),
}

export const billingService = {
  createBillingPlan: (data) => api.post('/billing/plans', data),
  getBillingPlans: () => api.get('/billing/plans'),
  assignBillingPlan: (planId, data) => api.post(`/billing/plans/${planId}/assign`, data),
  
  // NLP Billing
  parseBillingIntent: (data) => api.post('/nlp/parse-billing-intent', data),
  validateBillingLogic: (data) => api.post('/nlp/validate-billing-logic', data),
}

export const analyticsService = {
  getDashboard: (timeframe, apiId, consumerId) => 
    api.get('/analytics/dashboard', { params: { timeframe, api_id: apiId, consumer_id: consumerId } }),
  getRevenue: (startDate, endDate, groupBy) =>
    api.get('/analytics/revenue', { params: { start_date: startDate, end_date: endDate, group_by: groupBy } }),
  getUsageTrends: (apiId, consumerId, days) =>
    api.get('/analytics/usage/trends', { params: { api_id: apiId, consumer_id: consumerId, days } }),
  getTopConsumers: (limit, timeframe) =>
    api.get('/analytics/top-consumers', { params: { limit, timeframe } }),
}

export const mlService = {
  // Configuration
  getMLConfig: () => api.get('/admin/ml/config'),
  enableMLGlobally: () => api.post('/admin/ml/enable'),
  disableMLGlobally: () => api.post('/admin/ml/disable'),
  enableFeature: (feature) => api.post(`/admin/ml/features/${feature}/enable`),
  disableFeature: (feature) => api.post(`/admin/ml/features/${feature}/disable`),
  updateFeatureConfig: (feature, config) => api.post(`/admin/ml/features/${feature}/config`, config),
  
  // Data Collection
  enableDataCollection: (settings) => api.post('/admin/ml/data-collection/enable', settings),
  disableDataCollection: () => api.post('/admin/ml/data-collection/disable'),
  
  // Training
  triggerManualTraining: (features) => api.post('/admin/ml/training/manual', { features }),
  getMLStatus: () => api.get('/ml/status'),
  getMLModels: () => api.get('/admin/ml/models'),
  
  // Predictions
  predictUsage: (data) => api.post('/ml/predict-usage', data),
  detectAnomalies: (data) => api.post('/ml/detect-anomalies', data),
  optimizePricing: (data) => api.post('/ml/optimize-pricing', data),
}

export const consumerService = {
  createConsumer: (data) => api.post('/admin/consumers', data),
  getConsumers: () => api.get('/admin/consumers'),
  getConsumerUsage: (consumerId, startDate, endDate) =>
    api.get(`/billing/consumers/${consumerId}/usage`, { params: { start_date: startDate, end_date: endDate } }),
  generateInvoice: (consumerId, billingCycle) =>
    api.get(`/billing/consumers/${consumerId}/invoice`, { params: { billing_cycle: billingCycle } }),
}

export default api
