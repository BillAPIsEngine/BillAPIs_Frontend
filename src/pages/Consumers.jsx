import React, { useState, useEffect } from 'react'
import { Users, Plus, Mail, Calendar } from 'lucide-react'
import { consumerService } from '../services/api'

export default function Consumers() {
  const [consumers, setConsumers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConsumers()
  }, [])

  const loadConsumers = async () => {
    try {
      // For demo - use mock data
      const mockConsumers = [
        {
          consumer_id: 'consumer_1',
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          is_active: true,
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          consumer_id: 'consumer_2', 
          name: 'Startup XYZ',
          email: 'tech@startupxyz.com',
          is_active: true,
          created_at: '2024-02-20T00:00:00Z'
        }
      ]
      setConsumers(mockConsumers)
    } catch (error) {
      console.error('Error loading consumers:', error)
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumers</h1>
          <p className="text-gray-600 mt-1">Manage API consumers and their billing</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          <span>Add Consumer</span>
        </button>
      </div>

      {/* Consumers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consumers.map(consumer => (
          <div key={consumer.consumer_id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{consumer.name}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  {consumer.email}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  consumer.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {consumer.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(consumer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {consumers.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No consumers yet</h3>
          <p className="text-gray-600">Add your first consumer to start monetizing APIs</p>
        </div>
      )}
    </div>
  )
}
