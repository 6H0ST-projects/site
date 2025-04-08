import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const maxDuration = 60; // Extend timeout for this API route to 60 seconds

// This function handles streaming responses from the OpenAI API to the client
export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create streaming response by utilizing the OpenAI API's streaming capability
    const stream = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a health product analyzer with expertise in analyzing product ingredients and their health implications."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2500,
    });

    // Set up a readable stream to send back to the client
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        // Iterate through the stream as chunks come in
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // Send each content chunk to the client
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    // Return the stream in the response
    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error in search-analyze API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze product' },
      { status: 500 }
    );
  }
}