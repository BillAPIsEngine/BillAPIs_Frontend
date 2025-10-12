import React from 'react'

export default function StatCard({ title, value, icon: Icon, trend, description }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-semibold text-gray-900">
                {value}
              </div>
            </dd>
            {trend && (
              <div className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
            {description && (
              <div className="text-sm text-gray-500 mt-1">
                {description}
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
