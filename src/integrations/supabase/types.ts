export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      learning_paths: {
        Row: {
          audio_script: string | null
          audio_url: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_completed: boolean | null
          podcast_script: string | null
          title: string | null
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_script?: string | null
          audio_url?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          podcast_script?: string | null
          title?: string | null
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_script?: string | null
          audio_url?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_completed?: boolean | null
          podcast_script?: string | null
          title?: string | null
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_steps: {
        Row: {
          completed: boolean | null
          content: string | null
          created_at: string
          detailed_content: string | null
          id: string
          order_index: number
          path_id: string
          title: string
          updated_at: string
        }
        Insert: {
          completed?: boolean | null
          content?: string | null
          created_at?: string
          detailed_content?: string | null
          id?: string
          order_index: number
          path_id: string
          title: string
          updated_at?: string
        }
        Update: {
          completed?: boolean | null
          content?: string | null
          created_at?: string
          detailed_content?: string | null
          id?: string
          order_index?: number
          path_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_steps_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_sessions: {
        Row: {
          audio_completed: boolean | null
          audio_played: boolean | null
          content_mode: string | null
          content_scrolled_percent: number | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          interactions_count: number | null
          path_id: string | null
          referrer_source: string | null
          started_at: string
          step_id: string | null
          user_id: string
        }
        Insert: {
          audio_completed?: boolean | null
          audio_played?: boolean | null
          content_mode?: string | null
          content_scrolled_percent?: number | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interactions_count?: number | null
          path_id?: string | null
          referrer_source?: string | null
          started_at?: string
          step_id?: string | null
          user_id: string
        }
        Update: {
          audio_completed?: boolean | null
          audio_played?: boolean | null
          content_mode?: string | null
          content_scrolled_percent?: number | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          interactions_count?: number | null
          path_id?: string | null
          referrer_source?: string | null
          started_at?: string
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_sessions_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "learning_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      user_activity_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          path_id: string | null
          step_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          path_id?: string | null
          step_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          path_id?: string | null
          step_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_events_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_events_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "learning_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          content_complexity: string | null
          created_at: string
          daily_learning_time_minutes: number | null
          display_name: string | null
          last_learning_date: string | null
          learning_goals: string | null
          learning_streak_days: number | null
          learning_style: string | null
          longest_streak_days: number | null
          notification_preferences: Json | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          preferred_formats: Json | null
          preferred_learning_times: string[] | null
          preferred_pace: string | null
          timezone: string | null
          total_learning_time_minutes: number | null
          total_paths_completed: number | null
          total_steps_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          content_complexity?: string | null
          created_at?: string
          daily_learning_time_minutes?: number | null
          display_name?: string | null
          last_learning_date?: string | null
          learning_goals?: string | null
          learning_streak_days?: number | null
          learning_style?: string | null
          longest_streak_days?: number | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferred_formats?: Json | null
          preferred_learning_times?: string[] | null
          preferred_pace?: string | null
          timezone?: string | null
          total_learning_time_minutes?: number | null
          total_paths_completed?: number | null
          total_steps_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          content_complexity?: string | null
          created_at?: string
          daily_learning_time_minutes?: number | null
          display_name?: string | null
          last_learning_date?: string | null
          learning_goals?: string | null
          learning_streak_days?: number | null
          learning_style?: string | null
          longest_streak_days?: number | null
          notification_preferences?: Json | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          preferred_formats?: Json | null
          preferred_learning_times?: string[] | null
          preferred_pace?: string | null
          timezone?: string | null
          total_learning_time_minutes?: number | null
          total_paths_completed?: number | null
          total_steps_completed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
