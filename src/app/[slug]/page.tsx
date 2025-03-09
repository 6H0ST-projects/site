'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Meteors } from '../../components/ui/meteors'
import Link from 'next/link'
import './project-page.css'

// Define the page data interface
interface PageData {
  title: string;
  intro: string;
  bgColor: string;
  textColor: string;
  description: string[];
  sidebarText: string;
}

export default function ProjectPage() {
  const params = useParams()
  const slug = params.slug as string
  
  // Page data for each slug
  const getPageData = (slug: string): PageData => {
    switch(slug) {
      case 'project-001':
        return {
          title: 'Shadows & Light',
          intro: 'An exploration of contrast, form, and meaning in digital spaces.',
          bgColor: '#3D3D3D',
          textColor: '#fff',
          description: [
            "Project 001 creates a seamless blend of dark aesthetics with functional design, offering a unique digital experience.",
            "We're exploring the boundaries between form and function, creating spaces that feel alive and responsive."
          ],
          sidebarText: "In darkness we find definition. The contrast between light and shadow creates the shapes that define our reality and perception."
        }
      case 'project-014':
        return {
          title: 'Minimal Constructs',
          intro: 'Stripping away the unnecessary to reveal the essence of design.',
          bgColor: '#E7EAEE',
          textColor: '#000',
          description: [
            "Our minimalist approach focuses on removing distractions to highlight what truly matters.",
            "We believe in creating spaces that breathe, allowing ideas and interactions to take center stage."
          ],
          sidebarText: "Simplicity is the ultimate sophistication. What remains after we remove everything that isn't essential is the purest form of expression."
        }
      case 'project-500':
        return {
          title: 'Neon Frontiers',
          intro: 'Pushing boundaries with vibrant approaches to interaction and form.',
          bgColor: '#C3FF2A',
          textColor: '#000',
          description: [
            "Project 500 explores the vibrant world of bold colors and dynamic interactions.",
            "We're redefining what's possible in digital experiences through playful experimentation and unconventional thinking."
          ],
          sidebarText: "The future isn't a subdued space. It's vibrant, energetic, and constantly in motion. We capture that energy in every pixel, every interaction."
        }
      case 'about-us':
        return {
          title: 'The Team',
          intro: 'A collective of dreamers, thinkers, and makers creating new realities.',
          bgColor: '#FF680A',
          textColor: '#fff',
          description: [
            "We are a diverse group of creators united by our passion for pushing boundaries and challenging norms.",
            "Our team thrives on collaboration, bringing together unique perspectives to solve complex problems in innovative ways."
          ],
          sidebarText: "Together we are more than the sum of our parts. Our collective imagination allows us to see possibilities that would remain invisible to the individual."
        }
      case 'blog':
        return {
          title: 'Our Thoughts',
          intro: 'Reflections on creativity, design, and the future of digital experiences.',
          bgColor: '#5C5C5C',
          textColor: '#fff',
          description: [
            "Our blog is a space for sharing insights, discoveries, and ongoing conversations about design and technology.",
            "We explore emerging trends, document our process, and engage with the broader community of creators and thinkers."
          ],
          sidebarText: "Ideas need to be shared to evolve. Through conversation and reflection, we transform abstract concepts into tangible realities."
        }
      default:
        return {
          title: 'Project',
          intro: 'Exploring new ideas and possibilities.',
          bgColor: '#000000',
          textColor: '#fff',
          description: [
            "Details coming soon.",
            "Stay tuned for updates on this exciting new project."
          ],
          sidebarText: "Every great dream begins with a dreamer. Always remember, you have within you the strength, the patience, and the passion to reach for the stars, to change the world."
        }
    }
  }
  
  const pageData = getPageData(slug)
  
  useEffect(() => {
    // Set the background color on the body
    document.body.style.backgroundColor = pageData.bgColor
    document.body.style.color = pageData.textColor
    document.body.classList.add('project-page')
    
    return () => {
      // Clean up
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
      document.body.classList.remove('project-page')
    }
  }, [pageData.bgColor, pageData.textColor])
  
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
            <p className="sidebar-text">
              {pageData.sidebarText}
            </p>
          </div>
          
          <div className="main-content">
            <h2>{pageData.title}</h2>
            <p className="project-intro">{pageData.intro}</p>
            
            <div className="project-description">
              {pageData.description.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}