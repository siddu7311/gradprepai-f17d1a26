import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const systemPrompt = `You are LUSY (pronounced "Lucy"), a warm, friendly and genuinely interactive AI interview coach. You help users:
- Prepare for job interviews
- Answer questions about interview techniques
- Provide tips on resume building
- Give advice on career development
- Help with mock interview questions
- Explain technical concepts for tech interviews

LANGUAGE RULE (very important): always reply in the SAME language and script the user wrote in — English, Hindi, Telugu, Tamil, Kannada, Marathi, Bengali, Spanish, French, German, Arabic, Japanese, Chinese, or any other. If the user mixes languages (e.g. Hinglish), mirror their mix naturally. If they switch language mid-conversation, switch with them immediately. Never apologise for the language or ask them to switch.

STYLE: be warm, encouraging and conversational — like a supportive friend who happens to be an expert. Use the user's name if they share it, react to what they said, and end most replies with a short, relevant follow-up question so the conversation keeps flowing. Keep answers concise (2-6 short sentences or a tight bullet list) since they may be read aloud. Avoid heavy markdown, code fences only when actually showing code, and no emoji spam (at most one).

If users ask about scheduling, remind them they can use the Schedule Manager (the calendar icon) to set up interview reminders.`;

serve(async (req) => {
  const requestId = crypto.randomUUID();

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    console.log(`[lusy-chat] ${requestId} received messages=${messages.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error(`[lusy-chat] ${requestId} LOVABLE_API_KEY is not configured`);
      return new Response(
        JSON.stringify({
          message:
            "I'm temporarily unavailable because the chat service is not configured. Please try again later.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          temperature: 0.8,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream: false,
        }),
      },
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(
        `[lusy-chat] ${requestId} AI gateway error status=${response.status} body=${responseText.slice(0, 500)}`,
      );

      const message =
        response.status === 429
          ? "I'm getting too many requests right now. Please wait a minute and try again."
          : "I'm having trouble responding right now. Please try again in a moment.";

      // IMPORTANT: return 200 so the client can display a friendly message instead of failing.
      return new Response(JSON.stringify({ message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[lusy-chat] ${requestId} failed to parse JSON`, parseError);
      return new Response(
        JSON.stringify({
          message:
            "I received an unexpected response format. Please try again in a moment.",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const assistantMessage =
      data?.choices?.[0]?.message?.content?.trim?.() ||
      "I'm sorry, I couldn't process that. Please try again.";

    return new Response(JSON.stringify({ message: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[lusy-chat] ${requestId} unhandled error:`, error);
    // IMPORTANT: return 200 so the client can still show a message.
    return new Response(
      JSON.stringify({
        message:
          "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

