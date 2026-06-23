'use client'

import { useEffect, useRef, useState } from 'react'

export function ARBlade() {
  const containerRef = useRef<HTMLDivElement>(null!)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Check if already loaded
    if (customElements.get('spline-viewer')) {
      setLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://unpkg.com/@splinetool/viewer@1.12.97/build/spline-viewer.js'
    script.type = 'module'
    script.onload = () => setLoaded(true)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [])

  useEffect(() => {
    if (!loaded || !containerRef.current) return

    // Create spline-viewer via DOM to avoid TSX type error on custom element
    const viewer = document.createElement('spline-viewer') as unknown as HTMLElement
    viewer.setAttribute(
      'url',
      'https://prod.spline.design/20zWa5VJBGuGHXbv/scene.splinecode'
    )
    viewer.style.width = '100%'
    viewer.style.height = '100%'
    viewer.style.background = 'transparent'

    // Clear any existing content (like loading spinner)
    containerRef.current.innerHTML = ''
    containerRef.current.appendChild(viewer)

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [loaded])

  if (!loaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
