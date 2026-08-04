import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sweet, clear voices from the Lovable AI TTS model.
// LUSY = warm, sweet young female voice. SIDDU = calm, confident male voice.
const VOICES: Record<string, string> = {
  female: "sage",
  lusy: "sage",
  male: "onyx",
  amds: "onyx",
  siddu: "onyx",
};

const FEMALE_VOICES = new Set(["sage", "coral", "shimmer", "nova"]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const text: string = typeof body?.text === "string" ? body.text.trim() : "";
    const persona: string = typeof body?.persona === "string" ? body.persona : "female";
    const speed: number = typeof body?.speed === "number" ? body.speed : 1;
    const stream: boolean = body?.stream === true;

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
    const instructions = FEMALE_VOICES.has(voice)
      ? "You are LUSY, a warm and sweet young Indian woman. Speak with a soft, melodious, friendly female voice and a natural polished Indian English accent. Very clear articulation, gentle smiling tone, relaxed conversational pacing, softly encouraging — like a caring friend talking one to one. Never sound robotic, never spell names letter by letter (say Lusy as 'Lucy', Siddu as a word). Match the language of the text you are given (Hindi, Telugu, Tamil, Hinglish, English, etc.) and pronounce it like a native speaker."
      : "You are SIDDU, a calm, confident young Indian man. Speak with a clear male voice and a natural polished Indian English accent. Warm and friendly but professional, very clear articulation, steady conversational pacing. Never spell names letter by letter — say them as words. Match the language of the text you are given (Hindi, Telugu, Tamil, Hinglish, English, etc.) and pronounce it like a native speaker.";

    const speedValue = Math.min(1.3, Math.max(0.7, speed));

    // Streaming path: pass the gateway's SSE (base64 PCM chunks) straight through so
    // the browser can start playing within a few hundred milliseconds.
    if (stream) {
      const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
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
          speed: speedValue,
          stream_format: "sse",
          response_format: "pcm",
        }),
      });

      if (!streamResponse.ok || !streamResponse.body) {
        const errorText = await streamResponse.text().catch(() => "");
        console.error(`[voice-tts] stream error ${streamResponse.status}: ${errorText.slice(0, 400)}`);
        return new Response(
          JSON.stringify({ error: "TTS failed", status: streamResponse.status }),
          { status: streamResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      return new Response(streamResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }

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
        speed: speedValue,
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
