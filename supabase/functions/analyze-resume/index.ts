import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const systemPrompt = `You are GradPrep AI – Resume Builder, an advanced AI specializing in creating world-class, ATS-optimized, recruiter-approved resumes for students and fresh graduates preparing for tech and engineering jobs.

Your task is to analyze, improve, and optimize resumes with professionalism, clarity, and precision.

When analyzing a resume, you MUST return a valid JSON object with this exact structure:
{
  "improvedResume": {
    "contactInfo": { "name": "", "email": "", "phone": "", "linkedin": "", "github": "", "portfolio": "" },
    "summary": "",
    "skills": { "technical": [], "soft": [], "tools": [] },
    "experience": [{ "title": "", "company": "", "duration": "", "bullets": [] }],
    "projects": [{ "name": "", "description": "", "technologies": [], "bullets": [] }],
    "education": [{ "degree": "", "institution": "", "year": "", "gpa": "" }],
    "certifications": []
  },
  "atsScore": 0,
  "recruiterReadinessScore": 0,
  "strengths": [],
  "weaknesses": [],
  "improvements": [],
  "suggestedSkills": []
}

Guidelines:
- atsScore: 0-100 based on keyword optimization, formatting, and ATS compatibility
- recruiterReadinessScore: 0-100 based on impact, clarity, and professional appeal
- Use strong action verbs and quantify achievements where possible
- Optimize for the target role if specified
- Be specific and actionable in your improvements
- Return ONLY the JSON object, no markdown or additional text`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, targetRole } = await req.json();
    
    if (!resumeContent) {
      return new Response(
        JSON.stringify({ error: 'Resume content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = targetRole 
      ? `Analyze and optimize this resume for a ${targetRole} position:\n\n${resumeContent}`
      : `Analyze and optimize this resume:\n\n${resumeContent}`;

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze resume' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the response
    let analysis;
    try {
      // Remove any markdown code blocks if present
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse analysis results' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Resume analysis completed successfully');
    
    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
