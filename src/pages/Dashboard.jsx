import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { analyticsService } from '../services/api'
import { mlService } from '../services/api'
import StatCard from '../components/common/StatCard'
import RevenueChart from '../components/analytics/RevenueChart'
import UsageTrends from '../components/analytics/UsageTrends'
import AnomalyAlerts from '../components/ml/AnomalyAlerts'

export default function Dashboard() {
  const [stats, setStats] = useState({})
  const [revenueData, setRevenueData] = useState([])
  const [usageTrends, setUsageTrends] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [dashboardRes, revenueRes, trendsRes, mlStatus] = await Promise.all([
        analyticsService.getDashboard('7d'),
        analyticsService.getRevenue(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0],
          'day'
        ),
        analyticsService.getUsageTrends(null, null, 7),
        mlService.getMLStatus()
      ])

      setStats(dashboardRes.data.dashboard)
      setRevenueData(revenueRes.data)
      setUsageTrends(trendsRes.data)

      // Load anomalies if ML is enabled
      if (mlStatus.data.global_enabled && mlStatus.data.enabled_features.anomaly_detection) {
        // In a real app, you'd fetch actual anomaly data
        setAnomalies([
          {
            id: 1,
            type: 'usage_spike',
            severity: 'high',
            consumer: 'consumer_123',
            api: 'payment-api',
            timestamp: new Date().toISOString(),
            description: 'Unusual spike in API usage detected'
          }
        ])
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${stats.total_revenue?.toLocaleString() || '0'}`}
          icon={CreditCard}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Consumers"
          value={stats.total_consumers?.toLocaleString() || '0'}
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="API Calls (7d)"
          value={stats.total_apis?.toLocaleString() || '0'}
          icon={BarChart3}
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard
          title="Active Plans"
          value={stats.active_billing_plans?.toLocaleString() || '0'}
          icon={TrendingUp}
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      {/* Anomaly Alerts */}
      {anomalies.length > 0 && (
        <AnomalyAlerts anomalies={anomalies} />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <RevenueChart data={revenueData} />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
          <UsageTrends data={usageTrends} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recent_activity?.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'sync' ? 'bg-green-500' :
                  activity.type === 'billing' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-600">{activity.description}</span>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
