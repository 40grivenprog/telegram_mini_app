// API service for booking API integration
// Используем относительный путь - Vite прокси перенаправит на booking_api
// If VITE_API_BASE_URL is set, use it; otherwise use relative path for Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api' // Use relative path to leverage Vite proxy

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

      // Check if response has content before trying to parse JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      // Improve error logging
      const errorMessage = error.message || String(error)
      
      // Check for network/CORS errors
      if (
        error instanceof TypeError || 
        errorMessage.includes('fetch') || 
        errorMessage.includes('Load failed') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('Network request failed')
      ) {
        // Network error or CORS issue
        const apiBaseInfo = {
          VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'not set',
          baseURL: this.baseURL,
          constructedURL: url,
          usingProxy: !import.meta.env.VITE_API_BASE_URL
        }
        
        console.error('Network/CORS error detected:', {
          url,
          error: errorMessage,
          errorType: error.constructor.name,
          apiConfig: apiBaseInfo,
          stack: error.stack
        })
        
        // Provide helpful error message
        const proxyHint = apiBaseInfo.usingProxy 
          ? '\nNote: Using Vite proxy (relative path). Make sure Vite dev server is running on port 8000.'
          : '\nNote: Using direct API URL. Make sure the API server is running and accessible.'
        
        const helpfulMessage = `Cannot connect to API at ${url}. ` +
          `Possible causes:\n` +
          `1. Server is not running (check http://localhost:8080/health)\n` +
          `2. CORS is not configured correctly (server needs restart after CORS changes)\n` +
          `3. Network connectivity issue\n` +
          `4. Vite proxy not working (if using relative paths)${proxyHint}\n\n` +
          `API Config: ${JSON.stringify(apiBaseInfo, null, 2)}\n` +
          `Original error: ${errorMessage}`
        
        throw new Error(helpfulMessage)
      }
      
      // Re-throw with better context for other errors
      console.error('API request failed:', {
        url,
        method: options.method || 'GET',
        error: errorMessage,
        errorType: error.constructor.name,
        stack: error.stack
      })
      throw error
    }
  }

  // Check if user exists by chat_id
  async getUserByChatID(chatID, locale = 'en') {
    return this.request(`/users/${chatID}?locale=${locale}`)
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

  // Get professionals with pagination (excluding subscribed ones)
  async getProfessionals(page = 1, pageSize = 15) {
    return this.request(`/clients/professionals/all?page=${page}&pageSize=${pageSize}`)
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
    return this.request(`/clients/appointments/${appointmentID}`, {
      method: 'DELETE',
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

  // Get appointment details
  async getAppointmentDetails(appointmentID) {
    return this.request(`/professionals/appointments/${appointmentID}`)
  }

  // Create unavailable appointment
  async createUnavailableAppointment(appointmentData) {
    return this.request(`/professionals/unavailable_appointments`, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    })
  }

  // Create group visit appointment
  async createGroupVisitAppointment(appointmentData) {
    return this.request(`/professionals/group_visit_appointments`, {
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

  // Get previous appointments with optional client filter and pagination
  async getPreviousAppointments(clientID = null, page = 1, pageSize = 15) {
    const params = new URLSearchParams()
    if (clientID) {
      params.append('client_id', clientID)
    }
    params.append('page', page.toString())
    params.append('pageSize', pageSize.toString())
    return this.request(`/professionals/previous_appointments?${params.toString()}`)
  }

  // Update client locale
  async updateClientLocale(locale) {
    return this.request('/clients/update_locale', {
      method: 'PATCH',
      body: JSON.stringify({ locale }),
    })
  }

  // Update professional locale
  async updateProfessionalLocale(locale) {
    return this.request('/professionals/update_locale', {
      method: 'PATCH',
      body: JSON.stringify({ locale }),
    })
  }

  // Subscribe to professional
  async subscribeToProfessional(professionalID, chatID, locale) {
    return this.request(`/clients/subscribe`, {
      method: 'POST',
      body: JSON.stringify({
        professional_id: professionalID,
        chat_id: chatID,
        locale: locale,
      }),
    })
  }

  // Unsubscribe from professional
  async unsubscribeFromProfessional(professionalID) {
    return this.request(`/clients/unsubscribe/${professionalID}`, {
      method: 'DELETE',
    })
  }

  // Get subscribed professionals with pagination
  async getSubscribedProfessionals(page = 1, pageSize = 15) {
    return this.request(`/clients/professionals?page=${page}&pageSize=${pageSize}`)
  }

  // Get professional subscriptions
  async getProfessionalSubscriptions() {
    return this.request(`/professionals/subscriptions`)
  }
}

export const apiService = new ApiService()
