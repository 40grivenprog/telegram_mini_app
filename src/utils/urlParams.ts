/**
 * Utility functions for reading URL query parameters
 * In Telegram Mini App, parameters are passed via tgWebAppStartParam in URL
 */

/**
 * Get a query parameter value from URL
 * @param paramName - The name of the query parameter
 * @returns The value of the parameter or null if not found
 */
export function getQueryParam(paramName: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const url = new URL(window.location.href)
    const tgWebAppStartParam = url.searchParams.get('tgWebAppStartParam')
    
    if (tgWebAppStartParam) {
      // Check if it matches the expected format (e.g., "appointment_UUID" or "invite_UUID")
      if (paramName === 'appointment_id' && tgWebAppStartParam.startsWith('appointment_')) {
        return tgWebAppStartParam.replace('appointment_', '')
      }
      if (paramName === 'invite_id' && tgWebAppStartParam.startsWith('invite_')) {
        return tgWebAppStartParam.replace('invite_', '')
      }
    }
    
    // Fallback to regular URL params
    return url.searchParams.get(paramName)
  } catch (e) {
    // URL parsing failed, fallback to window.location.search
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(paramName)
  }
}

/**
 * Remove appointment_id parameter from URL
 * Should be called after the appointment details modal is shown and user interacts with it
 */
export function removeAppointmentParamFromURL(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const url = new URL(window.location.href)
    let hasChanges = false
    
    // Remove tgWebAppStartParam if it contains appointment_id
    const tgWebAppStartParam = url.searchParams.get('tgWebAppStartParam')
    if (tgWebAppStartParam && tgWebAppStartParam.startsWith('appointment_')) {
      url.searchParams.delete('tgWebAppStartParam')
      hasChanges = true
    }
    
    if (hasChanges) {
      const newUrl = url.pathname + url.search + url.hash
      window.history.replaceState({}, '', newUrl)
    }
  } catch (e) {
    // URL parsing failed, try fallback
    try {
      const urlParams = new URLSearchParams(window.location.search)
      let hasChanges = false
      
      if (urlParams.has('appointment_id')) {
        urlParams.delete('appointment_id')
        hasChanges = true
      }
      
      if (hasChanges) {
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash
        window.history.replaceState({}, '', newUrl)
      }
    } catch (e2) {
      // Ignore errors
    }
  }
}

/**
 * Remove invite_id parameter from URL
 * Should be called after the invite details modal is shown and user interacts with it
 */
export function removeInviteParamFromURL(): void {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const url = new URL(window.location.href)
    let hasChanges = false
    
    // Remove tgWebAppStartParam if it contains invite_id
    const tgWebAppStartParam = url.searchParams.get('tgWebAppStartParam')
    if (tgWebAppStartParam && tgWebAppStartParam.startsWith('invite_')) {
      url.searchParams.delete('tgWebAppStartParam')
      hasChanges = true
    }
    
    if (hasChanges) {
      const newUrl = url.pathname + url.search + url.hash
      window.history.replaceState({}, '', newUrl)
    }
  } catch (e) {
    // URL parsing failed, try fallback
    try {
      const urlParams = new URLSearchParams(window.location.search)
      let hasChanges = false
      
      if (urlParams.has('invite_id')) {
        urlParams.delete('invite_id')
        hasChanges = true
      }
      
      if (hasChanges) {
        const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '') + window.location.hash
        window.history.replaceState({}, '', newUrl)
      }
    } catch (e2) {
      // Ignore errors
    }
  }
}
