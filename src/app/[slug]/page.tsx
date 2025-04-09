'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Meteors } from '../../components/ui/meteors'
import Link from 'next/link'
import './project-page.css'
import dynamic from 'next/dynamic'

// Define the interface for the imported module
interface ProductAnalysisAppModule {
  ProductAnalysisApp: React.ComponentType;
}

// Dynamically import the ProductAnalysisApp to prevent SSR issues
const ProductAnalysisApp = dynamic(
  () => import('../projects/project-529/page').then(mod => {
    // Extract the ProductAnalysisApp component from the module
    const { ProductAnalysisApp } = mod as ProductAnalysisAppModule;
    return ProductAnalysisApp;
  }),
  { ssr: false }
)

// Define the page data interface
interface PageData {
  title: string;
  intro: string;
  bgColor: string;
  textColor: string;
  description: string[];
  sidebarText: string;
}

// Wrapper component to ensure consistent style application
function ProjectPageContent({ pageData, slug }: { pageData: PageData, slug: string }) {
  const router = useRouter()
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Set project-specific background and text colors
    document.body.style.backgroundColor = pageData.bgColor
    document.body.style.color = pageData.textColor
    
    return () => {
      // Clean up
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [pageData.bgColor, pageData.textColor])
  
  return (
    <div className="page-wrapper">
      <div className="meteors-container">
        <Meteors number={40} />
      </div>
      
      <div className="content-container">
        <Link 
          href="/" 
          className="back-link"
          onClick={(e) => {
            e.preventDefault();
            router.push('/')
          }}
        >
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
            
            {slug === 'project-001' && (
              <div className="">
                <div className="video-container" style={{ maxWidth: '800px' }}>
                  <video controls style={{ width: '100%' }}>
                    <source src="/project-001.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
            
            {slug === 'project-529' && (
              <div className="product-analyzer-container">
                <ProductAnalysisApp />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const params = useParams()
  const slug = params?.slug as string || ''
  
  // Page data for each slug
  const getPageData = (slug: string): PageData => {
    switch(slug) {
      case 'project-001':
        return {
          title: 'reach',
          intro: 'eliminate tedium.',
          bgColor: '#3D3D3D',
          textColor: '#fff',
          description: [
            "reach consolidates existing llm agent tooling into a single platform.",
            "as the ecosystem of llm offerings explodes, there exists a need to drive towards simplicity, prioritize privacy, and deliver on made promises."
          ],
          sidebarText: "simple can be harder than complex: you have to work hard to get your thinking clean to make it simple. but it's worth it in the end because once you get there, you can move mountains."
        }
      case 'project-529':
        return {
          title: 'redacted',
          intro: 'optimize consumption.',
          bgColor: '#BBBDC3',
          textColor: '#000',
          description: [
            "redacted evaluates products for various health impacts using computer vision and novel research capabilities.",
            "upload a photo of a product, its label, and provide a description to receive comprehensive analysis on indgredients, certifications, and healthier alternatives."
          ],
          sidebarText: "Be a yardstick of quality. Some people aren't used to an environment where excellence is expected."
        }
      case 'project-014':
        return {
          title: 'redacted',
          intro: 'design matter.',
          bgColor: '#E7EAEE',
          textColor: '#000',
          description: [
            "coming soon.",
            ""
          ],
          sidebarText: "imagination is more important than knowledge. knowledge is limited. imagination encircles the world."
        }
      case 'project-500':
        return {
          title: 'redacted',
          intro: 'learn nature.',
          bgColor: '#C3FF2A',
          textColor: '#000',
          description: [
            "coming soon.",
            ""
          ],
          sidebarText: "optimism is a strategy for making a better future. because unless you believe that the future can be better, you are unlikely to step up and take responsibility for making it so."
        }
      case 'about-us':
        return {
          title: 'general human optimizing strategic technology - projects',
          intro: 'seek challenges.',
          bgColor: '#FF680A',
          textColor: '#fff',
          description: [
            "almost everything, all external expectations, all pride, all fear of embarrassment or failure, these things just fall away in the face of death, leaving only what is truly important. remembering that you are going to die is the best way I know to avoid the trap of thinking you have something to lose. you are already naked. there is no reason not to follow your heart.",
            "there has never been a better time to push the bleeding edge. software is a solved problem and the entirety of human knowledge is at our fingertips; an individual's creativity is the only limit."
          ],
          sidebarText: "we choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard."
        }
      case 'blog':
        return {
          title: 'ramblings',
          intro: 'voice opinions.',
          bgColor: '#5C5C5C',
          textColor: '#fff',
          description: [
            "coming soon.",
            ""
          ],
          sidebarText: "conformity is the jailer of freedom and the enemy of growth."
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
  
  // Class handling at the root level
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Remove home page class first
    document.body.classList.remove('home-page')
    // Add the project-page class
    document.body.classList.add('project-page')
    
    return () => {
      document.body.classList.remove('project-page')
    }
  }, [])
  
  // Return the page content
  return <ProjectPageContent pageData={pageData} slug={slug} />
}