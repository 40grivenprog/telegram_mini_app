/**
 * Example usage of URL query parameters in React components
 * 
 * This file demonstrates different ways to read query parameters on the frontend.
 * You can delete this file after reviewing the examples.
 */

import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getQueryParam, getAllQueryParams } from './urlParams'

// Example 1: Using React Router's useSearchParams (recommended if using React Router v6)
export function ExampleWithReactRouter() {
  const [searchParams] = useSearchParams()
  
  // Get a specific parameter
  const someParam = searchParams.get('some_query_param')
  
  // Get all parameters as an object
  const allParams = Object.fromEntries(searchParams.entries())
  
  useEffect(() => {
    if (someParam) {
      console.log('Parameter value:', someParam)
      // Use the parameter value here
    }
  }, [someParam])
  
  return (
    <div>
      <p>Query param value: {someParam || 'not set'}</p>
      <pre>{JSON.stringify(allParams, null, 2)}</pre>
    </div>
  )
}

// Example 2: Using the utility functions (works anywhere, not just in React Router components)
export function ExampleWithUtilityFunctions() {
  useEffect(() => {
    // Read a specific parameter
    const someParam = getQueryParam('some_query_param')
    if (someParam) {
      console.log('Parameter value:', someParam)
      // Use the parameter value here
    }
    
    // Read all parameters
    const allParams = getAllQueryParams()
    console.log('All query parameters:', allParams)
  }, [])
  
  const someParam = getQueryParam('some_query_param')
  const allParams = getAllQueryParams()
  
  return (
    <div>
      <p>Query param value: {someParam || 'not set'}</p>
      <pre>{JSON.stringify(allParams, null, 2)}</pre>
    </div>
  )
}

// Example 3: Using window.location directly (vanilla JavaScript approach)
export function ExampleWithWindowLocation() {
  useEffect(() => {
    // Get query string
    const queryString = window.location.search
    
    // Parse it
    const urlParams = new URLSearchParams(queryString)
    const someParam = urlParams.get('some_query_param')
    
    if (someParam) {
      console.log('Parameter value:', someParam)
    }
  }, [])
  
  return <div>Check console for query parameter value</div>
}

// Example 4: Reading parameters when app loads (in AppRouter or main component)
export function ExampleOnAppLoad() {
  useEffect(() => {
    // This runs once when component mounts
    const appointmentID = getQueryParam('appointment_id')
    const action = getQueryParam('action')
    
    if (appointmentID) {
      console.log('Appointment ID from URL:', appointmentID)
      // Navigate to appointment details, etc.
    }
    
    if (action === 'view') {
      console.log('Action is view')
      // Handle view action
    }
  }, [])
  
  return null
}
