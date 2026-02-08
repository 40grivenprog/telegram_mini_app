import { useState, useEffect, useCallback } from 'react'
import { apiService } from '../../../services/api'
import i18n from '../../../i18n/config.js'
import { formatDateLocal } from '../../../utils/date'

export interface AvailabilitySlot {
  start_time: string
  end_time: string
  available: boolean
}

export interface ProfessionalSubscription {
  id: string
  first_name: string
  last_name: string
  chat_id: number | null
  locale: string
}

export interface CreateGroupVisitClient {
  id: string
  chat_id: number
  locale: string
}

interface UseGroupVisitResult {
  selectedDate: string | null
  setSelectedDate: (date: string | null) => void
  availableSlots: AvailabilitySlot[]
  slotsLoading: boolean
  slotsError: string | null
  selectedSlot: AvailabilitySlot | null
  setSelectedSlot: (slot: AvailabilitySlot | null) => void
  type: 'split' | 'group'
  setType: (type: 'split' | 'group') => void
  subscriptions: ProfessionalSubscription[]
  subscriptionsLoading: boolean
  subscriptionsError: string | null
  selectAll: boolean
  selectedClients: Set<string>
  handleSelectAllChange: (checked: boolean) => void
  handleClientChange: (subscriptionId: string, checked: boolean, type: 'split' | 'group') => void
  description: string
  setDescription: (desc: string) => void
  createGroupVisit: (onSuccess: () => void) => Promise<void>
  creating: boolean
  error: string | null
}

export function useGroupVisit(professionalID: string): UseGroupVisitResult {
  const [selectedDate, setSelectedDateState] = useState<string | null>(formatDateLocal(new Date()))

  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsError, setSlotsError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlotState] = useState<AvailabilitySlot | null>(null)

  const [type, setType] = useState<'split' | 'group'>('group')

  const [subscriptions, setSubscriptions] = useState<ProfessionalSubscription[]>([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [subscriptionsError, setSubscriptionsError] = useState<string | null>(null)

  const [selectAll, setSelectAll] = useState(false)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())

  const [description, setDescription] = useState('')

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load subscriptions on mount
  useEffect(() => {
    const loadSubscriptions = async () => {
      setSubscriptionsLoading(true)
      setSubscriptionsError(null)
      try {
        const response = await apiService.getProfessionalSubscriptions() as { subscriptions: ProfessionalSubscription[] }
        setSubscriptions(response.subscriptions || [])
      } catch (err: any) {
        setSubscriptionsError(err.message || 'Failed to load subscriptions')
        setSubscriptions([])
      } finally {
        setSubscriptionsLoading(false)
      }
    }
    loadSubscriptions()
  }, [])

  const setSelectedDate = useCallback((date: string | null) => {
    setSelectedDateState(date)
    setSelectedSlotState(null)
    setError(null)
  }, [])

  const setSelectedSlot = useCallback((slot: AvailabilitySlot | null) => {
    setSelectedSlotState(slot)
    setError(null)
  }, [])

  // Load slots when date changes
  useEffect(() => {
    if (!professionalID || !selectedDate) {
      setAvailableSlots([])
      return
    }

    const load = async () => {
      setSlotsLoading(true)
      setSlotsError(null)
      try {
        const data = await apiService.getProfessionalAvailability(professionalID, selectedDate) as { slots: AvailabilitySlot[] }
        const available = data.slots?.filter((slot) => slot.available) || []
        setAvailableSlots(available)
      } catch (err: any) {
        setSlotsError(err.message || i18n.t('error.loadAvailabilityFailed'))
        setAvailableSlots([])
      } finally {
        setSlotsLoading(false)
      }
    }
    load()
  }, [professionalID, selectedDate])

  const handleSelectAllChange = useCallback((checked: boolean) => {
    setSelectAll(checked)
    if (checked) {
      setSelectedClients(new Set())
    }
  }, [])

  const handleClientChange = useCallback((subscriptionId: string, checked: boolean, type: 'split' | 'group') => {
    if (checked) {
      // For split type, only allow 2 clients max
      if (type === 'split') {
        setSelectedClients(prev => {
          if (prev.size >= 2) {
            return prev // Don't add if already at limit
          }
          const newSet = new Set(prev)
          newSet.add(subscriptionId)
          return newSet
        })
      } else {
        setSelectedClients(prev => {
          const newSet = new Set(prev)
          newSet.add(subscriptionId)
          return newSet
        })
      }
      setSelectAll(false)
    } else {
      setSelectedClients(prev => {
        const newSet = new Set(prev)
        newSet.delete(subscriptionId)
        return newSet
      })
    }
  }, [])

  const createGroupVisit = useCallback(async (onSuccess: () => void) => {
    if (!selectedSlot || !description.trim()) return

    const validSubscriptions = subscriptions.filter(s => s.chat_id !== null)

    const clients: CreateGroupVisitClient[] = selectAll
      ? []
      : Array.from(selectedClients)
          .map(id => {
            const subscription = validSubscriptions.find(s => s.id === id)
            if (!subscription || subscription.chat_id === null || subscription.chat_id === undefined) return null
            if (!subscription.locale || subscription.locale.trim() === '') return null
            return {
              id: subscription.id,
              chat_id: subscription.chat_id,
              locale: subscription.locale,
            }
          })
          .filter((client): client is CreateGroupVisitClient => client !== null)

    setCreating(true)
    setError(null)

    try {
      await apiService.createGroupVisitAppointment({
        start_at: selectedSlot.start_time,
        end_at: selectedSlot.end_time,
        description: description.trim(),
        type,
        clients_selected: selectAll ? 'all' : 'partially_selected',
        clients,
      })

      const tg = (window as any).Telegram?.WebApp
      if (tg) {
        tg.HapticFeedback.notificationOccurred('success')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || i18n.t('error.createGroupVisitFailed'))
    } finally {
      setCreating(false)
    }
  }, [selectedSlot, description, type, selectAll, selectedClients, subscriptions])

  return {
    selectedDate,
    setSelectedDate,
    availableSlots,
    slotsLoading,
    slotsError,
    selectedSlot,
    setSelectedSlot,
    type,
    setType,
    subscriptions,
    subscriptionsLoading,
    subscriptionsError,
    selectAll,
    selectedClients,
    handleSelectAllChange,
    handleClientChange,
    description,
    setDescription,
    createGroupVisit,
    creating,
    error,
  }
}
