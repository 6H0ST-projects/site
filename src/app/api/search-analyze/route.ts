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

    // Enhanced system prompt to encourage proper markdown link formatting
    const enhancedSystemPrompt = `${systemPrompt || "You are a health product analyzer with expertise in analyzing product ingredients and their health implications."}
    
Important: When citing sources or referencing websites, always use proper markdown link syntax: [link text](url). This ensures the information is both properly attributed and clickable for the user.`;

    // Create a streaming response using the web search enabled model
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-search-preview", // Use the search-enabled model
      web_search_options: {
        search_context_size: "medium",
      },
      messages: [
        {
          role: "system",
          content: enhancedSystemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: true,
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