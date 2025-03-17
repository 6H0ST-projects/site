import { NextRequest, NextResponse } from 'next/server';

// Map of file keys to their direct download URLs
const fileMap: Record<string, { url: string, filename: string, contentType: string }> = {
  'mac-universal': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/Reach-1.0.0-universal-IFrerTVlTI1bQY5hGoipjqWrowOZIZ.dmg',
    filename: 'Reach-1.0.0-universal.dmg',
    contentType: 'application/octet-stream'
  },
  'windows': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-setup-f6YbwihNtvLTkTW0A1olRo7LCzXQjx.exe',
    filename: 'reach-1.0.0-setup.exe',
    contentType: 'application/octet-stream'
  },
  'windows-portable': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-portable-iGgwTohRXFzoEbTnzDupdLAeChbwgc.exe',
    filename: 'reach-1.0.0-portable.exe',
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