'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HealthAnalyzerRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Add project page class to maintain styling consistency
    document.body.classList.remove('home-page')
    document.body.classList.add('project-page')
    
    // Set project-specific colors
    document.body.style.backgroundColor = '#BBBDC3'
    document.body.style.color = '#000'
    
    // Redirect after a short delay
    const redirectTimer = setTimeout(() => {
      router.push('/projects/project-529')
    }, 1000)
    
    return () => {
      clearTimeout(redirectTimer)
      document.body.classList.remove('project-page')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [router])
  
  return (
    <div className="page-wrapper">
      <div className="content-container" style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <h1 style={{ fontWeight: 300, fontSize: '2rem' }}>redirecting to product health analyzer</h1>
        <p style={{ fontWeight: 300, opacity: 0.8 }}>
          If you are not redirected automatically, please <Link href="/projects/project-529" style={{ textDecoration: 'underline' }}>click here</Link>.
        </p>
      </div>
    </div>
  )
} 