import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { image, prompt } = await req.json();
    
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Call OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt || "Analyze this image in detail." },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
    });

    // Extract and return the analysis
    const analysis = response.choices[0]?.message?.content || "Analysis could not be generated.";
    
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error processing image analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}