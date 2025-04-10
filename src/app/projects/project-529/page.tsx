'use client'

import { useEffect, useState, useRef, ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Meteors } from '../../../components/ui/meteors'
import Link from 'next/link'
import '../../[slug]/project-page.css'
import './styles.css'

// Product Analysis App Component
export function ProductAnalysisApp() {
  const [productImage, setProductImage] = useState<string | null>(null)
  const [labelImage, setLabelImage] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [healthScore, setHealthScore] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingText, setStreamingText] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
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
  
  // Function to convert base64 to blob for API submission
  const base64ToBlob = (base64: string, contentType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1])
    const byteArrays = []
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    
    return new Blob(byteArrays, { type: contentType })
  }
  
  // Function to handle analysis request using OpenAI APIs
  const analyzeProduct = async () => {
    if (!productImage || !description) {
      addLog('Please provide a product image and description')
      return
    }
    
    setIsProcessing(true)
    setResult(null)
    setHealthScore(null)
    setStreamingText("")
    setError(null)
    
    addLog('Starting product analysis...')
    
    try {
      // Step 1: Analyze the product image with vision model
      addLog('Analyzing product image...')
      const productVisionResponse = await analyzeImageWithVision(productImage, "Analyze this product and identify key components that might have health implications.")
      
      // Step 2: If a label image exists, analyze it too
      let labelVisionResponse = ""
      if (labelImage) {
        addLog('Analyzing nutrition/ingredients label...')
        labelVisionResponse = await analyzeImageWithVision(labelImage, "Read and analyze this nutrition/ingredients label carefully. List all ingredients and any potential health concerns.")
      }
      
      // Step 3: Use the web search capability to find health information
      addLog('Searching for health information on ingredients...')
      addLog('Researching alternative products...')
      addLog('Generating health assessment report...')
      
      // Create prompt for search-enabled model
      const systemPrompt = `You are a health product analyzer with expertise in analyzing product ingredients and their health implications. Your task is to:
1. Evaluate the provided product based on the image analysis and description
2. Research potential health implications of ingredients or materials
3. Find evidence-based sources for your claims
4. Suggest healthier alternatives
5. Provide a health score on a scale of 1-10 (1=toxic, 10=exceptionally healthy)

Format your response as a detailed report with headers in markdown format and include the health score.`

      const userPrompt = `
PRODUCT IMAGE ANALYSIS:
${productVisionResponse}

${labelImage ? `LABEL IMAGE ANALYSIS:
${labelVisionResponse}

` : ''}
PRODUCT DESCRIPTION:
${description}

Analyze this product thoroughly for potential health impacts. Use reputable sources like scientific journals for your analysis. Provide:
1. Overall health score (1-10)
2. Key ingredients analysis
3. Health implications
4. Healthier alternatives
5. References to scientific sources

Return response formatted with markdown headers.`

      await streamSearchResponse(systemPrompt, userPrompt)
      
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      addLog('Error processing request. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // Function to analyze image with OpenAI Vision model
  const analyzeImageWithVision = async (imageData: string, prompt: string): Promise<string> => {
    try {
      // Extract content type from data URL
      const contentType = imageData.split(';')[0].split(':')[1]
      const blob = base64ToBlob(imageData, contentType)
      
      // Convert blob to base64 for API submission
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      })
      
      const base64Data = await base64Promise
      
      // Prepare API request to OpenAI Vision
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Data,
          prompt: prompt,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.analysis
    } catch (error) {
      console.error('Vision API error:', error)
      throw new Error('Failed to analyze image')
    }
  }
  
  // Function to stream search-enabled model response
  const streamSearchResponse = async (systemPrompt: string, userPrompt: string) => {
    try {
      const response = await fetch('/api/search-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userPrompt,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      // Process the streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Response body cannot be read')
      
      const decoder = new TextDecoder()
      let done = false
      let accumulatedText = ''
      
      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true })
          accumulatedText += chunk
          setStreamingText(accumulatedText)
          
          // Extract health score if present - try multiple regex patterns
          try {
            const scoreMatches = [
              accumulatedText.match(/health score:?\s*(\d+)\/10/i),
              accumulatedText.match(/score:?\s*(\d+)\/10/i),
              accumulatedText.match(/score of (\d+)\/10/i),
              accumulatedText.match(/score: (\d+)\/10/i),
              accumulatedText.match(/score (\d+)\/10/i),
              accumulatedText.match(/(\d+)\/10 health score/i),
              accumulatedText.match(/overall health score:?\s*(\d+)\/10/i),
              accumulatedText.match(/: (\d+)\/10/i)
            ]
            
            // Find the first successful match
            for (const match of scoreMatches) {
              if (match && match[1]) {
                const score = parseInt(match[1], 10)
                if (score >= 1 && score <= 10) {
                  setHealthScore(score)
                  break
                }
              }
            }
          } catch (error) {
            console.error('Error extracting health score:', error)
          }
        }
      }
      
      // Set final result
      setResult(accumulatedText)
    } catch (error) {
      console.error('Streaming error:', error)
      throw new Error('Failed to stream response')
    }
  }
  
  // Helper function to add logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, message])
  }
  
  return (
    <div className="product-analysis-container">
      <div className="input-section">
        <div className="upload-container">
        <p className="project-description">1. upload product image</p>
          <div 
            className={`upload-area ${productImage ? 'has-image' : ''}`}
            onClick={() => fileInputProductRef.current?.click()}
          >
            {productImage ? (
              <div className="preview-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productImage} alt="Product" className="preview-image" />
              </div>
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
        <p className="project-description">2. upload label image (optional)</p>
          <div 
            className={`upload-area ${labelImage ? 'has-image' : ''}`}
            onClick={() => fileInputLabelRef.current?.click()}
          >
            {labelImage ? (
              <div className="preview-image-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={labelImage} alt="Product Label" className="preview-image" />
              </div>
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
        <p className="project-description">3. describe the product</p>
        <textarea
          className="text-black"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., cereal box, dietary supplement, you can also list ingredients, ask about certifications, or anything else you'd like to know."
          rows={3}
          style={{ '::placeholder': { color: '#666' } }}
        />
      </div>
      
      <button 
        className="analyze-button" 
        onClick={analyzeProduct}
        disabled={isProcessing || !productImage || !description}
      >
        {isProcessing ? 'analyzing...' : 'analyze product'}
      </button>
      
      {error && (
        <div className="error-message">
          <p>error: {error}</p>
          <p>please try again or contact support if the issue persists.</p>
        </div>
      )}
      
      {logs.length > 0 && (
        <div className="logs-container">
          <p className="project-description">analysis progress</p>
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
          <p>health score</p>
          <div className="score-display">
            <div className={`score-value score-${healthScore <= 3 ? 'low' : healthScore <= 7 ? 'medium' : 'high'}`}>
              {healthScore}/10
            </div>
            <div className="score-label">
              {healthScore <= 3 ? 'concerning' : healthScore <= 7 ? 'moderate' : 'healthy'}
            </div>
          </div>
        </div>
      )}
      
      {(streamingText || result) && (
        <div className="">
          <p className="project-description">detailed analysis</p>
          <div className="result">
            {(result || streamingText).split('\n').map((line, index) => {
              // Check for markdown link pattern: [text](url)
              const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
              const hasLinks = linkPattern.test(line);
              
              // Reset the regex pattern for use in the actual rendering
              linkPattern.lastIndex = 0;
              
              try {
                if (line.startsWith('##')) {
                  return <h2 key={index}>{line.replace('##', '').trim().toLowerCase()}</h2>;
                } else if (line.startsWith('###')) {
                  return <h3 key={index}>{line.replace('###', '').trim().toLowerCase()}</h3>;
                } else if (line.startsWith('- **')) {
                  // Check if the line has the expected format with at least 3 parts after splitting
                  const parts = line.split('**');
                  if (parts.length >= 3) {
                    return (
                      <div key={index} className="ingredient-analysis">
                        <strong>{parts[1]}</strong>
                        <span dangerouslySetInnerHTML={{ 
                          __html: parts[2].replace(
                            linkPattern, 
                            '<a href="$2" target="_blank" rel="noopener noreferrer" class="analysis-link">$1</a>'
                          ) 
                        }} />
                      </div>
                    );
                  } else {
                    // Fallback for malformed lines
                    return <p key={index}>{line}</p>;
                  }
                } else if (hasLinks) {
                  // For lines with links, use dangerouslySetInnerHTML to render HTML links
                  try {
                    return (
                      <p key={index} dangerouslySetInnerHTML={{ 
                        __html: line.replace(
                          linkPattern, 
                          '<a href="$2" target="_blank" rel="noopener noreferrer" class="analysis-link">$1</a>'
                        ) 
                      }} />
                    );
                  } catch (error) {
                    // If there's an error with the replacement, just render the plain text
                    console.error('Error rendering link:', error);
                    return <p key={index}>{line}</p>;
                  }
                } else {
                  return <p key={index}>{line}</p>;
                }
              } catch (error) {
                // Global error handler - if anything goes wrong, just show the plain text
                console.error('Error rendering line:', error);
                return <p key={index}>{line}</p>;
              }
            })}
            {isProcessing && <div className="typing-indicator">●●●</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Project529Page() {
  const router = useRouter()
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Remove home page class and add project page class
    document.body.classList.remove('home-page')
    document.body.classList.add('project-page')
    
    // Set project-specific background and text colors
    document.body.style.backgroundColor = '#BBBDC3'
    document.body.style.color = '#000'
    
    return () => {
      // Clean up
      document.body.classList.remove('project-page')
      document.body.style.backgroundColor = ''
      document.body.style.color = ''
    }
  }, [])
  
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
          ← back to home
        </Link>
        
        <div className="two-column-layout">
          <div className="sidebar">
            <h1>ghost-projects</h1>
            <p className="sidebar-text">
              Be a yardstick of quality. Some people aren't used to an environment where excellence is expected.
            </p>
          </div>
          
          <div className="main-content">
            <p className="project-intro">optimize consumption.</p>
            
            <div className="project-description">
              <p>a language model agent that evaluates products for health implications using computer vision and research capabilities.</p>
              <p>upload a photo of a product, its label, and provide a description to receive an analysis and healthier alternatives.</p>
            </div>
            
            <ProductAnalysisApp />
          </div>
        </div>
      </div>
    </div>
  )
} 