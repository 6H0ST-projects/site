import { NextRequest, NextResponse } from 'next/server';

// Map of file keys to their direct download URLs
const fileMap: Record<string, { url: string, filename: string, contentType: string }> = {
  'mac-dmg': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-arm64-EDHj9UbOToabdc5vKyYyg0F1BvTF3U.dmg',
    filename: 'reach-1.0.0-arm64.dmg',
    contentType: 'application/octet-stream'
  },
  'mac-zip': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-arm64-mtTGSJxJB97T5AZ1CsJUM6UhVO7Wru.zip',
    filename: 'reach-1.0.0-arm64.zip',
    contentType: 'application/zip'
  },
  'windows': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-setup-9vFuLBTwBhST1kHFZ1cR74Jt5Us6fc.exe',
    filename: 'reach-1.0.0-setup.exe',
    contentType: 'application/octet-stream'
  },
  'windows-portable': { 
    url: 'https://gqzkgvpzdiquahcv.public.blob.vercel-storage.com/reach-1.0.0-portable-Gl8kWXhPfc6VXS5ksR3Mrcm9AkpDz6.exe',
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