// API service for booking API integration
// Используем относительный путь - Vite прокси перенаправит на booking_api
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = null
  }

  setToken(token) {
    this.token = token
  }

  clearToken() {
    this.token = null
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    // Add Authorization header if token is available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      // Handle 404 as valid response
      if (response.status === 404) {
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      throw error
    }
  }

  // Check if user exists by chat_id
  async getUserByChatID(chatID) {
    return this.request(`/users/${chatID}`)
  }

  // Register client
  async registerClient(clientData) {
    return this.request('/clients/register', {
      method: 'POST',
      body: JSON.stringify(clientData),
    })
  }

  // Professional sign in
  async signInProfessional(professionalData) {
    return this.request('/professionals/sign_in', {
      method: 'POST',
      body: JSON.stringify(professionalData),
    })
  }

  // Get professionals with pagination
  async getProfessionals(page = 1, pageSize = 15) {
    return this.request(`/professionals?page=${page}&pageSize=${pageSize}`)
  }

  // Get professional availability
  async getProfessionalAvailability(professionalID, date) {
    return this.request(`/professionals/${professionalID}/availability?date=${date}`)
  }

  // Create appointment
  async createAppointment(appointmentData) {
    return this.request('/clients/book_appointment', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  }

  // Get professional appointments
  async getProfessionalAppointments(status = '', page = 1, pageSize = 15) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    return this.request(`/professionals/appointments?${params.toString()}`)
  }

  // Get client appointments
  async getClientAppointments(status = '', page = 1, pageSize = 15) {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    return this.request(`/clients/appointments?${params.toString()}`)
  }

  // Cancel client appointment
  async cancelClientAppointment(appointmentID, cancellationReason) {
    return this.request(`/clients/appointments/${appointmentID}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({
        cancellation_reason: cancellationReason,
      }),
    })
  }


  // Confirm professional appointment
  async confirmProfessionalAppointment(appointmentID) {
    return this.request(`/professionals/appointments/${appointmentID}/confirm`, {
      method: 'PATCH',
    })
  }

  // Cancel professional appointment
  async cancelProfessionalAppointment(appointmentID, cancellationReason) {
    return this.request(`/professionals/appointments/${appointmentID}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({
        cancellation_reason: cancellationReason,
      }),
    })
  }

  // Create unavailable appointment
  async createUnavailableAppointment(appointmentData) {
    return this.request(`/professionals/unavailable_appointments`, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  }

  // Get professional timetable
  async getProfessionalTimetable(date) {
    return this.request(`/professionals/timetable?date=${date}`)
  }

  // Get professional clients
  async getProfessionalClients(professionalID) {
    return this.request(`/professionals/${professionalID}/clients`)
  }

  // Get previous appointments by client
  async getPreviousAppointmentsByClient(professionalID, clientID, month) {
    const params = new URLSearchParams()
    params.append('client_id', clientID)
    if (month) {
      params.append('month', month) // Format: YYYY-MM
    }
    return this.request(`/professionals/${professionalID}/previous_appointments?${params.toString()}`)
  }
}

export const apiService = new ApiService()
