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

/** Fallback SVG placeholder image data URL for listings with zero images */
export const PLACEHOLDER_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23f3f4f6'/><g fill='%239ca3af' transform='translate(176, 110)'><path d='M19 5h-1v-1a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v1h-1a4 4 0 0 0-4 4v20a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4v-20a4 4 0 0 0-4-4zm-11-1h8v1h-8v-1zm13 25a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-20a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v20zm-8-15a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z' fill='%239ca3af'/></g><text x='50%' y='68%' fill='%236b7280' font-family='sans-serif' font-size='14' font-weight='500' text-anchor='middle'>No Image Available</text></svg>";

