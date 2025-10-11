import React, { useState, useEffect } from 'react'
import { Plus, Users, CreditCard, Brain } from 'lucide-react'
import { billingService, consumerService } from '../services/api'
import BillingPlanModal from '../components/billing/BillingPlanModal'
import BillingPlanCard from '../components/billing/BillingPlanCard'
import ConsumerAssignmentModal from '../components/billing/ConsumerAssignmentModal'
import NLPBillingAssistant from '../components/billing/NLPBillingAssistant'

export default function Billing() {
  const [billingPlans, setBillingPlans] = useState([])
  const [consumers, setConsumers] = useState([])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showNLPAssistant, setShowNLPAssistant] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const [plansRes, consumersRes] = await Promise.all([
        billingService.getBillingPlans(),
        consumerService.getConsumers()
      ])
      setBillingPlans(plansRes.data)
      setConsumers(consumersRes.data.consumers)
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePlan = async (data) => {
    try {
      await billingService.createBillingPlan(data)
      setShowPlanModal(false)
      setShowNLPAssistant(false)
      await loadBillingData()
    } catch (error) {
      console.error('Error creating billing plan:', error)
    }
  }

  const handleAssignPlan = async (planId, assignmentData) => {
    try {
      await billingService.assignBillingPlan(planId, assignmentData)
      setShowAssignmentModal(false)
      await loadBillingData()
    } catch (error) {
      console.error('Error assigning billing plan:', error)
    }
  }

  const handleNLPCreate = async (nlpData) => {
    try {
      // Parse NLP intent into structured billing plan
      const parsedResult = await billingService.parseBillingIntent({
        text: nlpData.description,
        nlp_provider: nlpData.nlp_provider
      })

      // Create billing plan from parsed result
      const billingPlan = {
        name: nlpData.name,
        description: nlpData.description,
        rules: parsedResult.data.billing_logic,
        is_active: true
      }

      await billingService.createBillingPlan(billingPlan)
      setShowNLPAssistant(false)
      await loadBillingData()
    } catch (error) {
      console.error('Error creating plan via NLP:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowNLPAssistant(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Assistant
          </button>
          <button
            onClick={() => setShowPlanModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-semibold text-gray-900">{billingPlans.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Consumers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {consumers.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <Brain className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">AI Plans</p>
              <p className="text-2xl font-semibold text-gray-900">
                {billingPlans.filter(p => p.metadata?.created_via_nlp).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Billing Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {billingPlans.map((plan) => (
          <BillingPlanCard
            key={plan.plan_id}
            plan={plan}
            onAssign={() => {
              setSelectedPlan(plan)
              setShowAssignmentModal(true)
            }}
          />
        ))}
      </div>

      {billingPlans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No billing plans yet</h3>
          <p className="text-gray-500 mb-6">Create your first billing plan to start monetizing your APIs</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Manual Plan
            </button>
            <button
              onClick={() => setShowNLPAssistant(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Use AI Assistant
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPlanModal && (
        <BillingPlanModal
          onClose={() => setShowPlanModal(false)}
          onSubmit={handleCreatePlan}
        />
      )}

      {showAssignmentModal && selectedPlan && (
        <ConsumerAssignmentModal
          plan={selectedPlan}
          consumers={consumers}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedPlan(null)
          }}
          onSubmit={handleAssignPlan}
        />
      )}

      {showNLPAssistant && (
        <NLPBillingAssistant
          onClose={() => setShowNLPAssistant(false)}
          onSubmit={handleNLPCreate}
        />
      )}
    </div>
  )
}
