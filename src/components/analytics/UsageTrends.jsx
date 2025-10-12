import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function UsageTrends({ data }) {
  // Sample data if none provided
  const chartData = data?.length > 0 ? data : [
    { api: 'Payment API', requests: 45000 },
    { api: 'Auth API', requests: 32000 },
    { api: 'User API', requests: 28000 },
    { api: 'Analytics API', requests: 15000 },
    { api: 'Notification API', requests: 12000 },
  ]

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="api" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            formatter={(value) => [value.toLocaleString(), 'Requests']}
          />
          <Bar 
            dataKey="requests" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
