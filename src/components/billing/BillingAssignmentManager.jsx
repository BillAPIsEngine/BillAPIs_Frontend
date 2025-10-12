import React, { useState } from 'react'
import { Plus, CreditCard, Api, Users, Package, Calendar } from 'lucide-react'
import { billingService } from '../../services/api'

const TARGET_TYPES = [
  { value: 'api', label: 'API', icon: Api, description: 'Apply to specific API' },
  { value: 'consumer', label: 'Consumer', icon: Users, description: 'Apply to specific consumer' },
  { value: 'api_product', label: 'API Product', icon: Package, description: 'Apply to API product bundle' }
]

export default function BillingAssignmentManager({ 
  assignments, 
  billingPlans, 
  apis, 
  apiProducts, 
  consumers,
  onAssignmentCreated 
}) {
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    billing_plan_id: '',
    target_type: 'api',
    target_id: '',
    effective_date: new Date().toISOString().split('T')[0],
    end_date: ''
  })

  const handleCreateAssignment = async () => {
    try {
      await billingService.createBillingAssignment({
        billing_plan_id: formData.billing_plan_id,
        target_type: formData.target_type,
        target_id: formData.target_id,
        effective_date: formData.effective_date,
        end_date: formData.end_date || undefined
      })

      setIsCreating(false)
      setFormData({
        billing_plan_id: '',
        target_type: 'api',
        target_id: '',
        effective_date: new Date().toISOString().split('T')[0],
        end_date: ''
      })
      onAssignmentCreated()
    } catch (error) {
      console.error('Error creating billing assignment:', error)
    }
  }

  const getTargetOptions = () => {
    switch (formData.target_type) {
      case 'api':
        return apis.map(api => ({ value: api.api_id, label: api.name, description: api.base_path }))
      case 'consumer':
        return consumers.map(consumer => ({ value: consumer.consumer_id, label: consumer.name, description: consumer.email }))
      case 'api_product':
        return apiProducts.map(product => ({ value: product.product_id, label: product.name, description: `${product.apis.length} APIs` }))
      default:
        return []
    }
  }

  const getTargetIcon = (targetType) => {
    const type = TARGET_TYPES.find(t => t.value === targetType)
    return type ? type.icon : Api
  }

  const getTargetName = (assignment, targetType, targetId) => {
    switch (targetType) {
      case 'api':
        const api = apis.find(a => a.api_id === targetId)
        return api?.name || targetId
      case 'consumer':
        const consumer = consumers.find(c => c.consumer_id === targetId)
        return consumer?.name || targetId
      case 'api_product':
        const product = apiProducts.find(p => p.product_id === targetId)
        return product?.name || targetId
      default:
        return targetId
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Billing Assignments</h2>
          <p className="text-gray-600">Assign billing plans to APIs, consumers, or API products</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Assignment Creation Form */}
      {isCreating && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Create Billing Assignment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Billing Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Billing Plan *
              </label>
              <select
                value={formData.billing_plan_id}
                onChange={(e) => setFormData(prev => ({ ...prev, billing_plan_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a billing plan</option>
                {billingPlans.map(plan => (
                  <option key={plan.plan_id} value={plan.plan_id}>
                    {plan.name} - {plan.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apply To *
              </label>
              <select
                value={formData.target_type}
                onChange={(e) => setFormData(prev => ({ ...prev, target_type: e.target.value, target_id: '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TARGET_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formData.target_type === 'api' ? 'API' : 
                 formData.target_type === 'consumer' ? 'Consumer' : 'API Product'} *
              </label>
              <select
                value={formData.target_id}
                onChange={(e) => setFormData(prev => ({ ...prev, target_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select {formData.target_type}</option>
                {getTargetOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.description && `- ${option.description}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Effective Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effective Date *
              </label>
              <input
                type="date"
                value={formData.effective_date}
                onChange={(e) => setFormData(prev => ({ ...prev, effective_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAssignment}
              disabled={!formData.billing_plan_id || !formData.target_id || !formData.effective_date}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Assignment
            </button>
          </div>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billing assignments yet</h3>
            <p className="text-gray-600 mb-6">Create your first billing assignment to start monetizing</p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Assignment
            </button>
          </div>
        ) : (
          assignments.map(assignment => {
            const Icon = getTargetIcon(assignment.target_type)
            const plan = billingPlans.find(p => p.plan_id === assignment.billing_plan_id)
            const targetName = getTargetName(assignment, assignment.target_type, assignment.target_id)

            return (
              <div key={assignment.assignment_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{targetName}</h4>
                      <p className="text-sm text-gray-600">
                        {assignment.target_type} • {plan?.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Effective: {new Date(assignment.effective_date).toLocaleDateString()}
                        </span>
                        {assignment.end_date && (
                          <span className="text-xs text-gray-500">
                            End: {new Date(assignment.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      assignment.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {assignment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
