import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await req.json();
    
    if (!userPrompt) {
      return new Response(
        JSON.stringify({ error: 'User prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a streaming response using the web search enabled model
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-search-preview", // Use the search-enabled model
      web_search_options: {
        search_context_size: "medium",
      },
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful health product analyzer that uses web search to find evidence-based information."
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      stream: true,
      temperature: 0.7,
    });

    // Create a streaming response for the client
    const textEncoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(textEncoder.encode(content));
          }
        }
        controller.close();
      },
    });

    // Return the streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error: any) {
    console.error('Error in search-analyze API:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate analysis',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}