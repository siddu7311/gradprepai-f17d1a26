import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_schedule",
  title: "Schedule a practice session",
  description: "Create a scheduled interview practice session or reminder for the signed-in user.",
  inputSchema: {
    title: z.string().trim().min(1).describe("Short title for the event."),
    scheduled_at: z.string().describe("When the event happens, as an ISO 8601 timestamp."),
    description: z.string().trim().optional().describe("Optional details."),
    event_type: z.enum(["interview", "practice", "reminder", "deadline"]).default("practice").describe("Kind of event."),
    reminder_minutes: z.number().int().min(0).max(1440).default(30).describe("Minutes before the event to notify."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, scheduled_at, description, event_type, reminder_minutes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const when = new Date(scheduled_at);
    if (Number.isNaN(when.getTime())) {
      return { content: [{ type: "text", text: "scheduled_at must be a valid ISO 8601 timestamp." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("schedules")
      .insert({
        user_id: ctx.getUserId()!,
        title,
        description: description ?? null,
        event_type: event_type ?? "practice",
        reminder_minutes: reminder_minutes ?? 30,
        scheduled_at: when.toISOString(),
      })
      .select("id, title, description, event_type, scheduled_at, reminder_minutes")
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Scheduled “${title}” for ${when.toISOString()}.` }],
      structuredContent: { schedule: data },
    };
  },
});