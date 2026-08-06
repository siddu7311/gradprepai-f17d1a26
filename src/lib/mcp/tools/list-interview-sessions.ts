import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_interview_sessions",
  title: "List interview sessions",
  description: "List the signed-in user's mock interview sessions, newest first, with role, difficulty, status and overall score.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("How many sessions to return."),
    status: z.enum(["completed", "in_progress", "abandoned"]).optional().describe("Filter by session status."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit, status }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("interview_sessions")
      .select("id, role_type, difficulty, experience_level, company_type, status, total_questions, completed_questions, overall_score, duration_minutes, started_at, completed_at")
      .order("started_at", { ascending: false })
      .limit(limit ?? 10);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { sessions: data ?? [] },
    };
  },
});