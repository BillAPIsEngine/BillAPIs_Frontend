import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function RevenueChart({ data }) {
  // Sample data if none provided
  const chartData = data?.length > 0 ? data : [
    { date: '2024-01', revenue: 1200 },
    { date: '2024-02', revenue: 1800 },
    { date: '2024-03', revenue: 1500 },
    { date: '2024-04', revenue: 2200 },
    { date: '2024-05', revenue: 2800 },
    { date: '2024-06', revenue: 3200 },
  ]

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            formatter={(value) => [`$${value}`, 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
