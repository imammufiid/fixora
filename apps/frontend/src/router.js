import { useEffect, useState } from 'react'

// Hash router minimal: #/admin/bookings/FX-1003?q=abc
const read = () => {
  const [path, qs = ''] = (location.hash.slice(1) || '/').split('?')
  return { path, parts: path.split('/').filter(Boolean), query: Object.fromEntries(new URLSearchParams(qs)) }
}

export function useRoute() {
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const f = () => setRoute(read())
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return route
}

export const navigate = (to, { replace = false } = {}) => {
  if (replace) location.replace('#' + to)
  else location.hash = to
}
