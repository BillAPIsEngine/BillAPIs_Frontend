import React from 'react'
import { BarChart3, TrendingUp, Users, CreditCard } from 'lucide-react'
import StatCard from '../components/common/StatCard'
import RevenueChart from '../components/analytics/RevenueChart'
import UsageTrends from '../components/analytics/UsageTrends'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="$12,458"
          icon={CreditCard}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="API Requests"
          value="2.4M"
          icon={BarChart3}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Active Consumers"
          value="142"
          icon={Users}
          trend={{ value: 5.7, isPositive: true }}
        />
        <StatCard
          title="Success Rate"
          value="99.2%"
          icon={TrendingUp}
          trend={{ value: 1.2, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <RevenueChart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
          <UsageTrends />
        </div>
      </div>
    </div>
  )
}
