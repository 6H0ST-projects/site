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
          intro: 'tedium resolved.',
          bgColor: '#3D3D3D',
          textColor: '#fff',
          description: [
            "reach consolidates existing llm agent tooling into a single platform.",
            "as the ecosystem of llm offerings explode, there exists a need to drive towards simplicity, prioritize privacy, and deliver on made promises."
          ],
          sidebarText: "simple can be harder than complex: you have to work hard to get your thinking clean to make it simple. but it’s worth it in the end because once you get there, you can move mountains."
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
              <div className="download-section">
                <h2>download reach (test build)</h2>
                <p>this is an unsigned test build. you may need to bypass security warnings during installation.</p>

                <h3>macOS downloads</h3>
                <a href="/downloads/AI%20Assistant-1.0.0-arm64.dmg" className="download-btn">
                  download for mac (apple silicon/arm64) - dmg
                </a>
                <a> </a>
                <a href="/downloads/AI%20Assistant-1.0.0-arm64-mac.zip" className="download-btn">
                  download for mac (apple silicon/arm64) - zip
                </a>

                <h3>windows downloads</h3>
                <a href="/downloads/reach%20Setup%201.0.0.exe" className="download-btn">
                  download for windows (arm64)
                </a>

                <div className="install-notes">
                  <h4>installation notes:</h4>
                  <ul>
                    <li><strong>mac users:</strong> right-click the app and select "open" to bypass gatekeeper warnings</li>
                    <li><strong>windows users:</strong> click "more info" then "run anyway" if smartscreen warning appears</li>
                    <li><strong>download size:</strong> ~120MB for Mac, ~95MB for Windows</li>
                  </ul>
                </div>
                
                <div className="alternate-download">
                  <h4>having trouble downloading?</h4>
                  <ul>
                    <li>
                      <a 
                        href="#" 
                        className="text-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open('mailto:support@ghost-projects.com?subject=Download%20Issue%20with%20Reach&body=I%20am%20having%20trouble%20downloading%20Reach.%20Please%20help.', '_blank');
                        }}
                      >
                        contact our support team
                      </a>
                    </li>
                    <li>
                      <a 
                        href="#"
                        className="text-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open('https://discord.gg/your-invite', '_blank');
                        }}
                      >
                        join our discord for alternative links
                      </a>
                    </li>
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