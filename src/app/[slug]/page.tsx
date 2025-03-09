'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Meteors } from '../../components/ui/meteors'
import Link from 'next/link'
import './project-page.css'

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  
  // Set the proper background color based on the slug
  const getBgColor = (slug: string) => {
    switch(slug) {
      case 'project-001': return '#3D3D3D'
      case 'project-014': return '#E7EAEE'
      case 'project-500': return '#C3FF2A'
      case 'about-us': return '#FF680A'
      case 'blog': return '#5C5C5C'
      default: return '#000000'
    }
  }
  
  // Set the proper text color based on the slug
  const getTextColor = (slug: string) => {
    return (slug === 'project-014' || slug === 'project-500') ? '#000' : '#fff'
  }
  
  useEffect(() => {
    // Set the background color on the body
    document.body.style.backgroundColor = getBgColor(slug)
    document.body.style.color = getTextColor(slug)
    document.body.classList.add('project-page')
    
    return () => {
      // Clean up
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
      document.body.classList.remove('project-page')
    }
  }, [slug])
  
  return (
    <div className="page-wrapper">
      <div className="meteors-container">
        <Meteors number={40} />
      </div>
      
      <div className="content-container">
        <Link href="/" className="back-link">
          ← Back to home
        </Link>
        
        <div className="two-column-layout">
          <div className="sidebar">
            <h1>ghost-projects</h1>
            <p>
              every great dream begins with a dreamer. always remember, 
              you have within you the strength, the patience, 
              and the passion to reach for the stars, to change the world.
            </p>
          </div>
          
          <div className="main-content">
            <h2>{slug}</h2>
            
            <div className="project-description">
              {slug === 'project-001' && (
                <>
                  <p>Project 001 explores the boundaries of what's possible when we stop limiting ourselves.</p>
                  <p>Further details coming soon.</p>
                </>
              )}
              
              {slug === 'project-014' && (
                <>
                  <p>Project 014 represents our exploration of light and minimalism.</p>
                  <p>Further details coming soon.</p>
                </>
              )}
              
              {slug === 'project-500' && (
                <>
                  <p>Project 500 pushes the boundaries of traditional design with vibrant approaches.</p>
                  <p>Further details coming soon.</p>
                </>
              )}
              
              {slug === 'about-us' && (
                <>
                  <p>We are dreamers, creators, and believers in pushing boundaries.</p>
                  <p>More about us coming soon.</p>
                </>
              )}
              
              {slug === 'blog' && (
                <>
                  <p>Our thoughts and explorations on creativity, design, and the future.</p>
                  <p>Blog posts coming soon.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}