/**
 * Formats a date to YYYY-MM-DD string using local timezone
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Generates an array of date strings for a given month, excluding past dates
 * @param month - The month to generate dates for
 * @returns Array of date strings in ISO format (YYYY-MM-DD) using local timezone
 */
export function generateAvailableDates(month: Date): string[] {
  const dates: string[] = []
  const today = new Date()
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  
  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    
    // Skip past dates
    if (dateOnly >= todayOnly) {
      dates.push(formatDateLocal(dateOnly))
    }
  }
  
  return dates
}
