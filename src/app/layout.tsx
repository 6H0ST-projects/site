import Script from 'next/script'
import type { Metadata } from 'next'

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
        {/* Inline styles to prevent FOUC */}
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap');
          @import url('https://unpkg.com/normalize.css');
          
          /* Base critical styles - no transitions */
          body {
            background-color: #fff;
            color: #000;
            font-family: 'DM Sans', serif, system-ui, -apple-system, sans-serif;
            margin: 0;
            padding: 0;
            /* No transitions for instant navigation */
            transition: none;
          }
          
          /* Ensure no animations at all */
          html.instant-nav * {
            animation: none !important;
            transition: none !important;
          }
        `}} />
      </head>
      <body>
        {/* Script to handle initial page load - only runs in browser */}
        <Script id="instant-navigation" strategy="afterInteractive">{`
          // Enable instant navigation between pages
          (function() {
            try {
              // Add class to disable all transitions
              document.documentElement.classList.add('instant-nav');
              
              // Handle any initial CSS setup
              document.addEventListener('DOMContentLoaded', function() {
                // Make sure styles are properly applied
                document.body.style.backgroundColor = document.body.style.backgroundColor || '#fff';
              });
            } catch (e) {
              console.log('Navigation setup error:', e);
            }
          })();
        `}</Script>
        
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
