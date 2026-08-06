import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_interview_report",
  title: "Get interview report",
  description: "Get the full question-by-question report for one of the signed-in user's interview sessions: questions, the user's answers, ideal answers, scores and feedback.",
  inputSchema: {
    session_id: z.string().uuid().describe("The interview session id (from list_interview_sessions)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ session_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: session, error: sessionError } = await supabase
      .from("interview_sessions")
      .select("id, role_type, difficulty, experience_level, status, overall_score, started_at, completed_at")
      .eq("id", session_id)
      .maybeSingle();
    if (sessionError) return { content: [{ type: "text", text: sessionError.message }], isError: true };
    if (!session) return { content: [{ type: "text", text: "No such interview session for this user." }], isError: true };

    const { data: results, error } = await supabase
      .from("interview_results")
      .select("question_number, question_text, user_answer, ideal_answer, score, technical_score, communication_score, problem_solving_score, confidence_score, strengths, weaknesses, feedback")
      .eq("session_id", session_id)
      .order("question_number", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const report = { session, questions: results ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(report, null, 2) }],
      structuredContent: report,
    };
  },
});