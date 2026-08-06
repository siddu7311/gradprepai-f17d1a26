import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_schedules",
  title: "List scheduled events",
  description: "List the signed-in user's scheduled interview practice events and reminders.",
  inputSchema: {
    upcoming_only: z.boolean().default(true).describe("Only return events scheduled in the future."),
    limit: z.number().int().min(1).max(50).default(20).describe("How many events to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ upcoming_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("schedules")
      .select("id, title, description, event_type, scheduled_at, reminder_minutes, notified")
      .order("scheduled_at", { ascending: true })
      .limit(limit ?? 20);
    if (upcoming_only !== false) query = query.gte("scheduled_at", new Date().toISOString());
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { schedules: data ?? [] },
    };
  },
});