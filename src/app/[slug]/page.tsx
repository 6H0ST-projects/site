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
          title: 'reach',
          intro: 'eliminate tedium.',
          bgColor: '#3D3D3D',
          textColor: '#fff',
          description: [
            "reach consolidates existing llm agent tooling into a single platform.",
            "as the ecosystem of llm offerings explodes, there exists a need to drive towards simplicity, prioritize privacy, and deliver on made promises."
          ],
          sidebarText: "simple can be harder than complex: you have to work hard to get your thinking clean to make it simple. but it’s worth it in the end because once you get there, you can move mountains."
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
            "we're at the beginning of a technological renaissance.",
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
  
  useEffect(() => {
    // Start with opacity 0 for smooth transition
    document.body.style.opacity = '0'
    
    // Small delay to ensure transition works
    setTimeout(() => {
      // Set the background color on the body
      document.body.style.backgroundColor = pageData.bgColor
      document.body.style.color = pageData.textColor
      document.body.classList.add('project-page')
      
      // Fade in content
      document.body.style.opacity = '1'
    }, 50)
    
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
        <Link 
          href="/" 
          className="back-link"
          onClick={(e) => {
            e.preventDefault();
            document.body.classList.add('loading');
            setTimeout(() => {
              window.location.href = '/';
            }, 200);
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
                <h2>download reach (test build)</h2>
                <p>this is an unsigned test build. you may need to bypass security warnings during installation.</p>

                <h3>macOS downloads</h3>
                <a 
                  href="#"
                  className="download-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`/api/direct-download?file=mac-dmg`);
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error('No download URL returned');
                      }
                    } catch (error) {
                      console.error('Download error:', error);
                      alert('Download error. Please try the alternative download method or contact support.');
                    }
                  }}
                >
                  download for mac (apple silicon/arm64) - dmg
                </a>
                <a 
                  href="#"
                  className="download-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`/api/direct-download?file=mac-zip`);
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error('No download URL returned');
                      }
                    } catch (error) {
                      console.error('Download error:', error);
                      alert('Download error. Please try the alternative download method or contact support.');
                    }
                  }}
                >
                  download for mac (apple silicon/arm64) - zip
                </a>

                <h3>windows downloads</h3>
                <a 
                  href="#"
                  className="download-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`/api/direct-download?file=windows`);
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        throw new Error('No download URL returned');
                      }
                    } catch (error) {
                      console.error('Download error:', error);
                      alert('Download error. Please try the alternative download method or contact support.');
                    }
                  }}
                >
                  download for windows (arm64)
                </a>

                <div className="">
                  <h4>installation notes:</h4>
                  <ul>
                    <li><strong>mac users:</strong> right-click the app and select &quot;open&quot; to bypass gatekeeper warnings</li>
                    <li><strong>windows users:</strong> click &quot;more info&quot; then &quot;run anyway&quot; if smartscreen warning appears</li>
                    <li><strong>download size:</strong> ~120MB for Mac, ~95MB for Windows</li>
                  </ul>
                </div>
                
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}