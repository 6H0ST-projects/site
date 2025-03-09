import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  const dmSans = await fetch(
    new URL('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300&display=swap')
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          backgroundColor: '#E7EAEE',
          padding: '40px',
        }}
      >
        <div
          style={{
            marginLeft: 'auto',
            marginRight: 'auto',
            fontFamily: 'DM Sans',
            fontSize: '80px',
            fontWeight: 300,
            color: '#000',
            lineHeight: 1,
          }}
        >
          ghost-projects
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'DM Sans',
          data: dmSans,
          style: 'normal',
          weight: 300,
        },
      ],
    }
  )
} 