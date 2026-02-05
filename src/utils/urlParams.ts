/**
 * Utility functions for reading URL query parameters
 */

/**
 * Get a query parameter value from the current URL
 * @param paramName - The name of the query parameter
 * @returns The value of the parameter or null if not found
 */
export function getQueryParam(paramName: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(paramName)
}

/**
 * Get all query parameters as an object
 * @returns An object with all query parameters
 */
export function getAllQueryParams(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {}
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  const params: Record<string, string> = {}
  
  urlParams.forEach((value, key) => {
    params[key] = value
  })
  
  return params
}

/**
 * React hook for reading query parameters (alternative to useSearchParams from react-router-dom)
 * @param paramName - The name of the query parameter to read
 * @returns The value of the parameter or null if not found
 */
export function useQueryParam(paramName: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(paramName)
}
