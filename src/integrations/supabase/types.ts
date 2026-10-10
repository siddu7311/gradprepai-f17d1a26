export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      enterprise_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          organization: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          organization?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      interview_results: {
        Row: {
          communication_score: number | null
          confidence_score: number | null
          created_at: string
          feedback: string | null
          id: string
          ideal_answer: string | null
          problem_solving_score: number | null
          question_number: number
          question_text: string
          score: number | null
          session_id: string
          strengths: string[] | null
          technical_score: number | null
          user_answer: string | null
          user_id: string
          weaknesses: string[] | null
        }
        Insert: {
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          ideal_answer?: string | null
          problem_solving_score?: number | null
          question_number: number
          question_text: string
          score?: number | null
          session_id: string
          strengths?: string[] | null
          technical_score?: number | null
          user_answer?: string | null
          user_id: string
          weaknesses?: string[] | null
        }
        Update: {
          communication_score?: number | null
          confidence_score?: number | null
          created_at?: string
          feedback?: string | null
          id?: string
          ideal_answer?: string | null
          problem_solving_score?: number | null
          question_number?: number
          question_text?: string
          score?: number | null
          session_id?: string
          strengths?: string[] | null
          technical_score?: number | null
          user_answer?: string | null
          user_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "interview_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_sessions: {
        Row: {
          company_type: string | null
          completed_at: string | null
          completed_questions: number
          created_at: string
          difficulty: string
          duration_minutes: number | null
          experience_level: string | null
          id: string
          overall_score: number | null
          role_type: string
          started_at: string
          status: string
          total_questions: number
          user_id: string
        }
        Insert: {
          company_type?: string | null
          completed_at?: string | null
          completed_questions?: number
          created_at?: string
          difficulty?: string
          duration_minutes?: number | null
          experience_level?: string | null
          id?: string
          overall_score?: number | null
          role_type: string
          started_at?: string
          status?: string
          total_questions?: number
          user_id: string
        }
        Update: {
          company_type?: string | null
          completed_at?: string | null
          completed_questions?: number
          created_at?: string
          difficulty?: string
          duration_minutes?: number | null
          experience_level?: string | null
          id?: string
          overall_score?: number | null
          role_type?: string
          started_at?: string
          status?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          notification_email: boolean | null
          notification_interview_reminders: boolean | null
          notification_push: boolean | null
          notification_weekly_summary: boolean | null
          phone: string | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notification_email?: boolean | null
          notification_interview_reminders?: boolean | null
          notification_push?: boolean | null
          notification_weekly_summary?: boolean | null
          phone?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          notification_email?: boolean | null
          notification_interview_reminders?: boolean | null
          notification_push?: boolean | null
          notification_weekly_summary?: boolean | null
          phone?: string | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          description: string | null
          event_type: string
          id: string
          notified: boolean | null
          reminder_minutes: number | null
          scheduled_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          notified?: boolean | null
          reminder_minutes?: number | null
          scheduled_at: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          notified?: boolean | null
          reminder_minutes?: number | null
          scheduled_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upi_payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string | null
          expires_at: string
          id: string
          payer_phone: string | null
          plan: string
          starts_at: string
          status: string
          upi_reference: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string | null
          expires_at?: string
          id?: string
          payer_phone?: string | null
          plan?: string
          starts_at?: string
          status?: string
          upi_reference: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string | null
          expires_at?: string
          id?: string
          payer_phone?: string | null
          plan?: string
          starts_at?: string
          status?: string
          upi_reference?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
