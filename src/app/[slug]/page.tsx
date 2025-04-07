'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Meteors } from '../../components/ui/meteors'
import Link from 'next/link'
import './project-page.css'

// Product Analysis App Component
function ProductAnalysisApp() {
  const [productImage, setProductImage] = useState<string | null>(null)
  const [labelImage, setLabelImage] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputProductRef = useRef<HTMLInputElement>(null)
  const fileInputLabelRef = useRef<HTMLInputElement>(null)
  
  // Function to handle image uploads
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, setImage: (img: string | null) => void) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        setImage(event.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }
  
  // Function to handle analysis request
  const analyzeProduct = async () => {
    if (!productImage || !description) {
      addLog('Please provide a product image and description')
      return
    }
    
    setIsProcessing(true)
    setResult(null)
    setHealthScore(null)
    addLog('Starting product analysis...')
    
    try {
      // Simulate API call and processing
      addLog('Analyzing product image...')
      await simulateDelay(1000)
      
      if (labelImage) {
        addLog('Analyzing nutrition/ingredients label...')
        await simulateDelay(1000)
      }
      
      addLog('Searching for health information on ingredients...')
      await simulateDelay(1500)
      
      addLog('Researching alternative products...')
      await simulateDelay(2000)
      
      addLog('Generating health assessment report...')
      await simulateDelay(1500)
      
      // Generate a mock result and score for demonstration
      const mockScore = Math.floor(Math.random() * 10) + 1
      setHealthScore(mockScore)
      
      generateMockResult(mockScore)
    } catch (error) {
      console.error('Analysis error:', error)
      addLog('Error processing request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Helper function to add logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }
  
  // Simulate delay for demo purposes
  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  
  // Generate mock analysis result
  const generateMockResult = (score: number) => {
    let resultText = ''
    
    // Introduction
    resultText += `## Health Assessment Report\n\n`
    resultText += `### Overall Health Score: ${score}/10\n\n`
    
    // Analysis based on score
    if (score >= 8) {
      resultText += `This product is among the healthier options available. Based on our analysis, it contains minimal harmful ingredients and offers good nutritional value.\n\n`
    } else if (score >= 5) {
      resultText += `This product falls in the moderate range for health considerations. While not harmful overall, there are some ingredients that may be concerning for certain individuals.\n\n`
    } else {
      resultText += `This product contains several ingredients that may pose health concerns. Consider the alternatives listed below for healthier options.\n\n`
    }
    
    // Ingredients analysis
    resultText += `### Key Ingredients Analysis\n\n`
    resultText += `- **${getRandomIngredient(score < 5)}: ${getRandomAnalysis(score < 5)}\n`
    resultText += `- **${getRandomIngredient(score < 7)}: ${getRandomAnalysis(score < 7)}\n`
    resultText += `- **${getRandomIngredient(false)}: ${getRandomAnalysis(false)}\n\n`
    
    // Health implications
    resultText += `### Health Implications\n\n`
    resultText += `Research published in the ${getRandomJournal()} indicates that ${getRandomHealth(score)}.\n\n`
    
    // Alternatives
    resultText += `### Healthier Alternatives\n\n`
    resultText += `1. **${getRandomAlternative()}**: Contains natural ingredients with similar functionality but lower health risks.\n`
    resultText += `2. **${getRandomAlternative()}**: Offers comparable benefits without the concerning additives.\n`
    resultText += `3. **${getRandomAlternative()}**: A more sustainable and health-conscious option.\n\n`
    
    // References
    resultText += `### References\n\n`
    resultText += `- ${getRandomJournal()} (${2018 + Math.floor(Math.random() * 5)}): "${getRandomStudyTitle()}"\n`
    resultText += `- ${getRandomJournal()} (${2019 + Math.floor(Math.random() * 4)}): "${getRandomStudyTitle()}"\n`
    
    setResult(resultText)
  }
  
  // Helper functions for mock data
  const getRandomIngredient = (harmful: boolean) => {
    const harmfulIngredients = [
      'High Fructose Corn Syrup', 'Red Dye 40', 'Sodium Nitrite', 
      'BHA (Butylated Hydroxyanisole)', 'Partially Hydrogenated Oils',
      'Aspartame', 'MSG (Monosodium Glutamate)', 'Sodium Benzoate'
    ]
    
    const safeIngredients = [
      'Whole Grain Flour', 'Natural Cane Sugar', 'Organic Cocoa', 
      'Chia Seeds', 'Flaxseed Oil', 'Plant-Based Protein', 
      'Organic Cane Sugar', 'Turmeric Extract'
    ]
    
    const list = harmful ? harmfulIngredients : safeIngredients
    return list[Math.floor(Math.random() * list.length)]
  }
  
  const getRandomAnalysis = (harmful: boolean) => {
    const harmfulAnalyses = [
      'Has been linked to metabolic disorders in multiple studies',
      'May cause hyperactivity and attention issues in sensitive individuals',
      'Potentially carcinogenic according to recent research',
      'Associated with inflammation and digestive issues',
      'May disrupt hormone function with regular consumption'
    ]
    
    const safeAnalyses = [
      'Provides essential nutrients and fiber',
      'Contains antioxidants that support immune function',
      'Offers omega-3 fatty acids beneficial for heart health',
      'Rich in vitamins and minerals essential for metabolism',
      'Has anti-inflammatory properties supported by research'
    ]
    
    const list = harmful ? harmfulAnalyses : safeAnalyses
    return list[Math.floor(Math.random() * list.length)]
  }
  
  const getRandomJournal = () => {
    const journals = [
      'Journal of Nutrition', 'Environmental Health Perspectives',
      'American Journal of Clinical Nutrition', 'Food Chemistry',
      'Journal of Food Science', 'International Journal of Food Sciences and Nutrition',
      'Nutrition Research', 'Journal of the Academy of Nutrition and Dietetics'
    ]
    
    return journals[Math.floor(Math.random() * journals.length)]
  }
  
  const getRandomHealth = (score: number) => {
    const goodHealth = [
      'regular consumption of these ingredients may support immune function',
      'the antioxidant properties of these components may reduce oxidative stress',
      'these natural compounds show promising effects on metabolic health',
      'these ingredients support gut microbiome diversity'
    ]
    
    const badHealth = [
      'prolonged exposure to these additives may contribute to chronic inflammation',
      'regular consumption of these compounds has been associated with increased risk of metabolic disorders',
      'some of these ingredients may disrupt endocrine function with long-term exposure',
      'these synthetic additives have shown adverse effects in long-term animal studies'
    ]
    
    const list = score >= 6 ? goodHealth : badHealth
    return list[Math.floor(Math.random() * list.length)]
  }
  
  const getRandomAlternative = () => {
    const alternatives = [
      'Organic Harvest Blend', 'NatureWay Pure', 'Clean Essentials',
      'PureSource Natural', 'Wholesome Basics', 'Earth Friendly Foods',
      'Green Choice Organics', 'Pure Pantry Essentials'
    ]
    
    return alternatives[Math.floor(Math.random() * alternatives.length)]
  }
  
  const getRandomStudyTitle = () => {
    const titles = [
      'Effects of Food Additives on Metabolic Health: A Systematic Review',
      'Comparative Analysis of Natural vs. Synthetic Food Ingredients',
      'Long-term Consumption Patterns of Processed Foods and Health Outcomes',
      'Nutritional Profile Analysis of Organic vs. Conventional Products',
      'Bioavailability of Nutrients in Processed Foods: Clinical Perspectives'
    ]
    
    return titles[Math.floor(Math.random() * titles.length)]
  }
  
  return (
    <div className="product-analysis-container">
      <h2>product health analyzer</h2>
      <p className="analyzer-intro">
        analyze products for potential health concerns and discover healthier alternatives
      </p>
      
      <div className="input-section">
        <div className="upload-container">
          <h3>1. upload product image</h3>
          <div 
            className={`upload-area ${productImage ? 'has-image' : ''}`}
            onClick={() => fileInputProductRef.current?.click()}
          >
            {productImage ? (
              <img src={productImage} alt="Product" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <p>click to upload or take photo</p>
                <small>jpg, png, heic formats</small>
              </div>
            )}
          </div>
          <input 
            type="file"
            ref={fileInputProductRef}
            onChange={(e) => handleImageUpload(e, setProductImage)}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="upload-container">
          <h3>2. upload label image (optional)</h3>
          <div 
            className={`upload-area ${labelImage ? 'has-image' : ''}`}
            onClick={() => fileInputLabelRef.current?.click()}
          >
            {labelImage ? (
              <img src={labelImage} alt="Product Label" className="preview-image" />
            ) : (
              <div className="upload-placeholder">
                <p>click to upload or take photo</p>
                <small>nutrition facts / ingredients label</small>
              </div>
            )}
          </div>
          <input 
            type="file"
            ref={fileInputLabelRef}
            onChange={(e) => handleImageUpload(e, setLabelImage)}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      </div>
      
      <div className="description-container">
        <h3>3. describe the product</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., cereal box, dietary supplement, cleaning product, cosmetic item, etc."
          rows={3}
        />
      </div>
      
      <button 
        className="analyze-button" 
        onClick={analyzeProduct}
        disabled={isProcessing || !productImage || !description}
      >
        {isProcessing ? 'analyzing...' : 'analyze product'}
      </button>
      
      {logs.length > 0 && (
        <div className="logs-container">
          <h3>analysis progress</h3>
          <div className="logs">
            {logs.map((log, index) => (
              <div key={index} className="log-entry">
                <span className="log-time">{new Date().toLocaleTimeString()}</span>
                <span className="log-message">{log}</span>
              </div>
            ))}
            {isProcessing && <div className="loader"></div>}
          </div>
        </div>
      )}
      
      {healthScore !== null && (
        <div className="health-score-container">
          <h3>health score</h3>
          <div className="score-display">
            <div className={`score-value score-${healthScore <= 3 ? 'low' : healthScore <= 7 ? 'medium' : 'high'}`}>
              {healthScore}/10
            </div>
            <div className="score-label">
              {healthScore <= 3 ? 'Concerning' : healthScore <= 7 ? 'Moderate' : 'Healthy'}
            </div>
          </div>
        </div>
      )}
      
      {result && (
        <div className="result-container">
          <h3>detailed analysis</h3>
          <div className="result">
            {result.split('\n').map((line, index) => (
              <div key={index} className="result-line">
                {line.startsWith('##') ? (
                  <h2>{line.replace('##', '').trim()}</h2>
                ) : line.startsWith('###') ? (
                  <h3>{line.replace('###', '').trim()}</h3>
                ) : line.startsWith('- **') ? (
                  <div className="ingredient-analysis">
                    <strong>{line.split('**')[1]}</strong>
                    <span>{line.split('**')[2]}</span>
                  </div>
                ) : (
                  <p>{line}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

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
  const router = useRouter()
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
      case 'project-123':
        return {
          title: 'redacted',
          intro: 'optimize consumption.',
          bgColor: '#4A90E2',
          textColor: '#000',
          description: [
            "a language model agent that evaluates products for health implications using computer vision and research capabilities.",
            "upload a photo of a product, its label, and provide a description to receive an analysis and healthier alternatives."
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
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Apply styles immediately without transitions
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
        <Link 
          href="/" 
          className="back-link"
          onClick={(e) => {
            e.preventDefault();
            
            // Navigate immediately without transition
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
                
                <div style={{ height: '20px' }}></div>
                
                <h2>download reach (test build)</h2>
                <p>this is an unsigned test build. you may need to bypass security warnings during installation.</p>

                <h3>macOS downloads</h3>
                <a 
                  href="#"
                  className="download-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`/api/direct-download?file=mac-universal`);
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
                  download for mac (apple universal) - dmg
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
                  download installer for windows
                </a>
                <a 
                  href="#"
                  className="download-btn"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const response = await fetch(`/api/direct-download?file=windows-portable`);
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
                  portable download for windows
                </a>

                <div className="">
                  <h4>installation notes:</h4>
                  <ul>
                    <li><strong>mac users:</strong> right-click the app and select &quot;open&quot; to bypass gatekeeper warnings</li>
                    <li><strong>windows users:</strong> click &quot;more info&quot; then &quot;run anyway&quot; if smartscreen warning appears. the portable version can be used if the installer version is not working.</li>
                    <li><strong>download size:</strong> ~120MB for Mac, ~95MB for Windows</li>
                  </ul>
                </div>
                
              </div>
            )}

            {slug === 'project-123' && (
              <ProductAnalysisApp />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}