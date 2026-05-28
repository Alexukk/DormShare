/** Capitalize first letter: "electronics" → "Electronics" */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Extract initials from a name: "Andrew Smith" → "AS" */
export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'A'
}

/** Format current time as "HH:MM" */
export function formatTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
