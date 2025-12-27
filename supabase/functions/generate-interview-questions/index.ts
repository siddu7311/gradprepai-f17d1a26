import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERSONA_PROMPTS = {
  amds: `You are AMDS, a professional male AI interviewer. You are:
- Direct and technical-focused
- Ask precise, challenging questions
- Provide concise feedback
- Maintain a formal but supportive tone
- Focus on problem-solving and technical depth`,
  
  lusy: `You are LUSY, a friendly female AI interviewer. You are:
- Warm and encouraging
- Ask thorough, well-structured questions
- Provide detailed, constructive feedback
- Create a comfortable interview environment
- Balance technical questions with behavioral ones`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { role, language, difficulty, persona, questionCount = 5 } = await req.json() as {
      role: string;
      language: string;
      difficulty: string;
      persona: keyof typeof PERSONA_PROMPTS;
      questionCount?: number;
    };

    console.log('Generating interview questions for:', { role, language, difficulty, persona, questionCount });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const personaPrompt = PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.lusy;
    
    const difficultyDescriptions: Record<string, string> = {
      beginner: 'basic concepts, fundamentals, and entry-level knowledge',
      intermediate: 'practical problems, best practices, and real-world scenarios',
      advanced: 'complex system design, architecture decisions, and advanced concepts'
    };

    const systemPrompt = `${personaPrompt}

You generate interview questions in JSON format only. No markdown, no extra text.`;

    const userPrompt = `Generate ${questionCount} interview questions for a ${role} position focusing on ${language}. 
The difficulty level is ${difficulty} (${difficultyDescriptions[difficulty] || difficultyDescriptions.intermediate}).

Format your response as a JSON array of objects with the following structure:
[
  {
    "question": "The interview question text",
    "followUp": "A potential follow-up question",
    "hints": ["hint1", "hint2"],
    "expectedTopics": ["topic1", "topic2"]
  }
]

Make questions conversational and appropriate for a ${persona === 'amds' ? 'direct, technical' : 'friendly, encouraging'} interview style.
Only respond with the JSON array, no other text.`;

    console.log('Sending request to Lovable AI Gateway...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway Error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI credits exhausted. Please add credits to continue.');
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      throw new Error('Invalid AI response');
    }

    console.log('AI Response received, parsing questions...');
    
    // Parse the JSON response
    let questions;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      questions = JSON.parse(cleanContent);
    } catch {
      // If parsing fails, try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Failed to parse questions, raw content:', content);
        throw new Error('Failed to parse questions from AI response');
      }
    }

    console.log('Successfully generated', questions.length, 'questions');

    return new Response(
      JSON.stringify({ 
        questions,
        persona,
        role,
        difficulty,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Question Generation Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
