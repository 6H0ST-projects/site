import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  try {
    // Load the DM Sans font
    const dmSansData = await fetch(
      new URL('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300&display=swap')
    ).then((res) => res.text());
    
    // Extract the actual font URL from the CSS
    const fontUrl = dmSansData.match(/src: url\(([^)]+)\)/)?.[1];
    
    // If we couldn't extract the URL, use a system font as fallback
    let fontData;
    if (fontUrl) {
      fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());
    }
    
    // Add grid background pattern
    const gridPattern = `
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
            <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    `;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            position: 'relative',
            padding: '40px',
          }}
        >
          {/* Background color */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#000',
              zIndex: 0,
            }}
          />
          
          {/* Text container */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: fontData ? 'DM Sans' : 'system-ui',
                fontSize: '120px',
                fontWeight: 300,
                color: '#fff',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              ghost-projects
            </div>
            <div
              style={{
                fontFamily: fontData ? 'DM Sans' : 'system-ui',
                fontSize: '36px',
                fontWeight: 300,
                color: '#aaa',
                marginTop: '20px',
                lineHeight: 1.2,
                textAlign: 'center',
              }}
            >
              never stop chasing ghosts
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: fontData ? [
          {
            name: 'DM Sans',
            data: fontData,
            style: 'normal',
            weight: 300,
          },
        ] : [],
      }
    )
  } catch (e) {
    console.error('Error generating OG image:', e);
    
    // Fallback to a simple image if there's an error
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '80px',
            fontWeight: 'bold',
          }}
        >
          ghost-projects
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}