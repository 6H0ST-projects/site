'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HealthAnalyzerRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/projects/project-529')
  }, [router])
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      backgroundColor: '#4A90E2',
      color: '#fff'
    }}>
      <h1>Redirecting to Product Health Analyzer...</h1>
      <p>If you are not redirected automatically, please <Link href="/projects/project-529" style={{ color: '#fff', textDecoration: 'underline' }}>click here</Link>.</p>
    </div>
  )
} 