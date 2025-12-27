import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, persona } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use Lovable AI to generate speech-like audio description
    // Since Lovable AI doesn't have direct TTS, we'll use a text-based approach
    // For production, you'd want to integrate with ElevenLabs or similar
    
    // For now, we'll return the text to be spoken using Web Speech API on the client
    // This provides a working solution without additional API keys
    
    const voiceSettings = persona === 'amds' 
      ? { pitch: 0.9, rate: 1.0, voice: 'male' }
      : { pitch: 1.1, rate: 0.95, voice: 'female' };

    return new Response(
      JSON.stringify({ 
        text,
        voiceSettings,
        persona,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('TTS Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});