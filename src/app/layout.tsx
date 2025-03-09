import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ghost-projects',
  description: 'its time to start dreaming again, never stop chasing ghosts.',
  openGraph: {
    title: 'ghost-projects',
    description: 'its time to start dreaming again, never stop chasing ghosts.',
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
    description: 'its time to start dreaming again, never stop chasing ghosts.',
    images: ['/api/og']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
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
