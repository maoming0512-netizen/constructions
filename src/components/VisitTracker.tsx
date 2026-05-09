'use client'

import { useEffect, useRef } from 'react'

export default function VisitTracker() {
  const tracked = useRef(false)

  useEffect(() => {
    if (tracked.current) return
    tracked.current = true
    fetch('/api/admin/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'visit' }),
    }).catch(() => {})
  }, [])

  return null
}
