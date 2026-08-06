import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_progress_summary",
  title: "Get progress summary",
  description: "Summarize the signed-in user's interview practice progress: sessions completed, average score, best score, and recurring strengths and weaknesses.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const [{ data: sessions, error: sessionsError }, { data: results, error: resultsError }] = await Promise.all([
      supabase.from("interview_sessions").select("status, overall_score, role_type, started_at"),
      supabase.from("interview_results").select("score, strengths, weaknesses").limit(500),
    ]);
    if (sessionsError) return { content: [{ type: "text", text: sessionsError.message }], isError: true };
    if (resultsError) return { content: [{ type: "text", text: resultsError.message }], isError: true };

    const all = sessions ?? [];
    const scored = all.map((s) => s.overall_score).filter((s): s is number => typeof s === "number");
    const tally = (values: (string[] | null)[]) => {
      const counts = new Map<string, number>();
      for (const list of values) for (const item of list ?? []) counts.set(item, (counts.get(item) ?? 0) + 1);
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([label, count]) => ({ label, count }));
    };

    const summary = {
      total_sessions: all.length,
      completed_sessions: all.filter((s) => s.status === "completed").length,
      average_score: scored.length ? Math.round((scored.reduce((a, b) => a + b, 0) / scored.length) * 10) / 10 : null,
      best_score: scored.length ? Math.max(...scored) : null,
      roles_practiced: [...new Set(all.map((s) => s.role_type).filter(Boolean))],
      questions_answered: (results ?? []).length,
      top_strengths: tally((results ?? []).map((r) => r.strengths)),
      top_weaknesses: tally((results ?? []).map((r) => r.weaknesses)),
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary, null, 2) }],
      structuredContent: summary,
    };
  },
});