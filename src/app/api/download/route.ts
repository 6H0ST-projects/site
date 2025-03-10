import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

// Map of file keys to their proper filenames
const fileMap: Record<string, { filename: string, contentType: string }> = {
  'mac-dmg': { 
    filename: 'AI Assistant-1.0.0-arm64.dmg',
    contentType: 'application/octet-stream'
  },
  'mac-zip': { 
    filename: 'AI Assistant-1.0.0-arm64-mac.zip',
    contentType: 'application/zip'
  },
  'windows': { 
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
    
    // List blobs to find the URL for the requested file
    const { blobs } = await list({
      prefix: `ghost-projects-blob/${fileInfo.filename}`,
    });

    // Find the matching blob
    const blob = blobs.find(blob => 
      blob.pathname.includes(fileInfo.filename)
    );

    if (!blob) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Instead of redirecting, which can lose headers, return a JSON response with the URL
    // The client can then fetch this URL directly
    return NextResponse.json({ 
      url: blob.url,
      filename: fileInfo.filename,
      contentType: fileInfo.contentType
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}