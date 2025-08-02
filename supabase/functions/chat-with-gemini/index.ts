import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, image, conversationHistory } = await req.json();

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Build the prompt for trading analysis
    let prompt = `You are TradeTalk AI, an expert trading assistant specializing in technical analysis, chart patterns, and market insights. You help traders with:

- Chart pattern recognition (head & shoulders, triangles, flags, etc.)
- Technical indicator analysis (RSI, MACD, moving averages, etc.)
- Market psychology and sentiment analysis
- Risk management strategies
- Entry and exit points

Always provide educational, insightful responses but never give direct financial advice. Focus on technical analysis and market education.

User's question: ${message}`;

    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      prompt += "\n\nRecent conversation context:\n";
      conversationHistory.slice(-3).forEach((msg: any) => {
        prompt += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    // Prepare request body
    const requestBody: any = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    // Add image if provided
    if (image) {
      requestBody.contents[0].parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image
        }
      });
      
      // Add specific chart analysis prompt when image is provided
      requestBody.contents[0].parts[0].text += "\n\nA chart image has been provided. Please analyze the chart for:\n- Trend direction and strength\n- Key support and resistance levels\n- Chart patterns (if any)\n- Technical indicators visible\n- Potential trading opportunities\n- Risk factors to consider\n\nProvide a detailed technical analysis of what you see in the chart.";
    }

    console.log('Calling Gemini API with request:', JSON.stringify(requestBody, null, 2));

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini API response:', JSON.stringify(geminiData, null, 2));

    if (!geminiData.candidates || geminiData.candidates.length === 0) {
      throw new Error('No response generated from Gemini API');
    }

    const response = geminiData.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ response }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I apologize, but I'm experiencing technical difficulties. Please try your question again in a moment." 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});