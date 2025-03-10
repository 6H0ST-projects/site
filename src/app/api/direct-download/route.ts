import { NextRequest, NextResponse } from 'next/server';

// Map of file keys to their direct download URLs
const fileMap: Record<string, { url: string, filename: string, contentType: string }> = {
  'mac-dmg': { 
    url: 'https://ghost-projects-blob.vercel.app/AI%20Assistant-1.0.0-arm64.dmg',
    filename: 'AI Assistant-1.0.0-arm64.dmg',
    contentType: 'application/octet-stream'
  },
  'mac-zip': { 
    url: 'https://ghost-projects-blob.vercel.app/AI%20Assistant-1.0.0-arm64-mac.zip',
    filename: 'AI Assistant-1.0.0-arm64-mac.zip',
    contentType: 'application/zip'
  },
  'windows': { 
    url: 'https://ghost-projects-blob.vercel.app/reach%20Setup%201.0.0.exe',
    filename: 'reach Setup 1.0.0.exe',
    contentType: 'application/octet-stream'
  }
};

export async function GET(request: NextRequest) {
  try {
    // Get the file key from the URL
    const { searchParams } = new URL(request.url);
    const fileKey = searchParams.get('file');

    if (!fileKey || !fileMap[fileKey]) {
      return NextResponse.json({ error: 'Invalid file key' }, { status: 400 });
    }

    // Get file metadata
    const fileInfo = fileMap[fileKey];

    // Return JSON with the URL
    return NextResponse.json({ 
      url: fileInfo.url,
      filename: fileInfo.filename,
      contentType: fileInfo.contentType
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}