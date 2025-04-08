import Script from 'next/script'
import type { Metadata } from 'next'
// Importing the globals.css here to ensure consistent loading
import './globals.css'

export const metadata: Metadata = {
  title: 'ghost-projects',
  description: 'never stop chasing ghosts.',
  metadataBase: new URL(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    title: 'ghost-projects',
    description: 'never stop chasing ghosts.',
    siteName: 'ghost-projects',
    images: [{
      url: '/api/og',
      width: 1200,
      height: 630,
      alt: 'ghost-projects'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ghost-projects',
    description: 'never stop chasing ghosts.',
    images: ['/api/og']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Static layout without any client-side generated values to avoid hydration errors
  return (
    <html lang="en">
      <head>
        {/* Removed inline styles to prevent style duplication */}
      </head>
      <body>
        {children}
        
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
