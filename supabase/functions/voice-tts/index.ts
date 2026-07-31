import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sweet, clear voices from the Lovable AI TTS model.
const VOICES: Record<string, string> = {
  female: "coral",
  lusy: "coral",
  male: "onyx",
  amds: "onyx",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const text: string = typeof body?.text === "string" ? body.text.trim() : "";
    const persona: string = typeof body?.persona === "string" ? body.persona : "female";
    const speed: number = typeof body?.speed === "number" ? body.speed : 1;

    if (!text) {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (text.length > 4000) {
      return new Response(JSON.stringify({ error: "text too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "TTS not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const voice = VOICES[persona] ?? VOICES.female;
    const instructions = voice === "coral"
      ? "Speak in a warm, sweet, friendly young woman's voice. Very clear articulation, natural pacing, gentle and encouraging. Pronounce names exactly as written."
      : "Speak in a calm, confident, professional man's voice. Very clear articulation and steady pacing. Pronounce names exactly as written.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini-tts",
        input: text,
        voice,
        instructions,
        speed: Math.min(1.3, Math.max(0.7, speed)),
        response_format: "mp3",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(`[voice-tts] gateway error ${response.status}: ${errorText.slice(0, 400)}`);
      return new Response(
        JSON.stringify({ error: "TTS failed", status: response.status, details: errorText.slice(0, 400) }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const audio = await response.arrayBuffer();
    return new Response(
      JSON.stringify({ audioContent: base64Encode(audio), mimeType: "audio/mpeg", voice }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[voice-tts] unhandled error", error);
    return new Response(JSON.stringify({ error: "Unexpected TTS error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
