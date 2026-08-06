import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listInterviewSessions from "./tools/list-interview-sessions";
import getInterviewReport from "./tools/get-interview-report";
import listSchedules from "./tools/list-schedules";
import createSchedule from "./tools/create-schedule";
import getProgressSummary from "./tools/get-progress-summary";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "gradprep-ai",
  title: "GradPrep AI",
  version: "0.1.0",
  instructions:
    "Tools for GradPrep AI, a mock-interview practice app. Use `list_interview_sessions` to find a user's practice sessions, `get_interview_report` for the question-by-question detail of one session, `get_progress_summary` for overall progress and recurring strengths/weaknesses, and `list_schedules`/`create_schedule` to review or add practice reminders. All tools act as the signed-in GradPrep AI user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listInterviewSessions, getInterviewReport, getProgressSummary, listSchedules, createSchedule],
});