import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERSONA_FEEDBACK_STYLES = {
  amds: `Provide feedback in a direct, technical style. Be concise but thorough. Focus on:
- Technical accuracy
- Code quality considerations
- Performance implications
- Best practices`,
  
  lusy: `Provide feedback in a warm, encouraging style. Be supportive but honest. Focus on:
- What was done well
- Areas for improvement
- Practical suggestions
- Encouragement for continued learning`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, answer, persona, role, expectedTopics } = await req.json() as {
      question: string;
      answer: string;
      persona: keyof typeof PERSONA_FEEDBACK_STYLES;
      role: string;
      expectedTopics?: string[];
    };

    console.log('Analyzing interview response for:', { role, persona });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const feedbackStyle = PERSONA_FEEDBACK_STYLES[persona] || PERSONA_FEEDBACK_STYLES.lusy;

    const systemPrompt = `You are an AI interviewer analyzing a candidate's response. You provide feedback in JSON format only.`;

    const userPrompt = `You are analyzing a candidate's response for a ${role} position.

Question asked: "${question}"

Candidate's answer: "${answer}"

${expectedTopics?.length ? `Expected topics to cover: ${expectedTopics.join(', ')}` : ''}

${feedbackStyle}

Provide a JSON response with:
{
  "score": <number 1-10>,
  "feedback": "<brief spoken feedback to give the candidate>",
  "strengths": ["<strength1>", "<strength2>"],
  "improvements": ["<improvement1>", "<improvement2>"],
  "topicsCovered": ["<topic1>", "<topic2>"],
  "followUpQuestion": "<optional follow-up question if needed>"
}

Only respond with the JSON object, no other text.`;

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

    console.log('AI Response received, parsing analysis...');
    
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Failed to parse analysis, raw content:', content);
        throw new Error('Failed to parse analysis from AI response');
      }
    }

    console.log('Successfully analyzed response, score:', analysis.score);

    return new Response(
      JSON.stringify({ 
        ...analysis,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Analysis Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
