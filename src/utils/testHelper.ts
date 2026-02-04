// This file contains test helper functions with intentional issues

// Missing TypeScript types
export function formatUserData(user) {
  console.log("Formatting user:", user)
  // Direct mutation
  user.fullName = user.firstName + " " + user.lastName
  return user
}

// Missing error handling
export async function fetchData(url) {
  const response = await fetch(url)
  const data = response.json() // Missing await
  return data
}

// Unused function
function unusedHelper() {
  return "This function is never used"
}

// Hardcoded strings
export const ERROR_MESSAGE = "Something went wrong"
export const SUCCESS_MESSAGE = "Operation completed"

// Missing return type
export function processData(data) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    result.push(data[i] * 2) // Potential type error
  }
  return result
}
