export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications_enabled: boolean
          auto_save_enabled: boolean
          default_timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string
          notifications_enabled?: boolean
          auto_save_enabled?: boolean
          default_timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string
          notifications_enabled?: boolean
          auto_save_enabled?: boolean
          default_timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_organizations: {
        Row: {
          id: string
          user_id: string
          organization_name: string
          organization_type: string | null
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_name: string
          organization_type?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_name?: string
          organization_type?: string | null
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      platforms: {
        Row: {
          id: string
          name: string
          display_name: string
          icon_url: string | null
          api_version: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          icon_url?: string | null
          api_version?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          icon_url?: string | null
          api_version?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_channels: {
        Row: {
          id: string
          user_id: string
          platform_id: string
          channel_name: string
          channel_id: string
          channel_type: string
          display_name: string | null
          avatar_url: string | null
          follower_count: number
          status: 'connected' | 'disconnected' | 'error' | 'expired'
          last_sync_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          platform_id: string
          channel_name: string
          channel_id: string
          channel_type: string
          display_name?: string | null
          avatar_url?: string | null
          follower_count?: number
          status?: 'connected' | 'disconnected' | 'error' | 'expired'
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          platform_id?: string
          channel_name?: string
          channel_id?: string
          channel_type?: string
          display_name?: string | null
          avatar_url?: string | null
          follower_count?: number
          status?: 'connected' | 'disconnected' | 'error' | 'expired'
          last_sync_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      channel_tokens: {
        Row: {
          id: string
          channel_id: string
          access_token: string
          refresh_token: string | null
          token_type: string
          expires_at: string | null
          scopes: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          access_token: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          scopes?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          access_token?: string
          refresh_token?: string | null
          token_type?: string
          expires_at?: string | null
          scopes?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      channel_permissions: {
        Row: {
          id: string
          channel_id: string
          permission_name: string
          is_granted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          permission_name: string
          is_granted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          permission_name?: string
          is_granted?: boolean
          created_at?: string
        }
      }
      campaign_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          template_type: 'b2b_launch' | 'consumer_product' | 'thought_leadership' | 'custom'
          settings: Json
          is_public: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          template_type: 'b2b_launch' | 'consumer_product' | 'thought_leadership' | 'custom'
          settings?: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          template_type?: 'b2b_launch' | 'consumer_product' | 'thought_leadership' | 'custom'
          settings?: Json
          is_public?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          template_id: string | null
          status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          template_id?: string | null
          status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          template_id?: string | null
          status?: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_pieces: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          content_type: 'blog_post' | 'article' | 'social_post' | 'custom'
          source_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          content_type?: 'blog_post' | 'article' | 'social_post' | 'custom'
          source_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          content_type?: 'blog_post' | 'article' | 'social_post' | 'custom'
          source_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      content_adaptations: {
        Row: {
          id: string
          content_piece_id: string
          platform_id: string
          adapted_content: string
          character_count: number | null
          hashtags: string[] | null
          mentions: string[] | null
          media_urls: string[] | null
          adaptation_rules: Json
          is_auto_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_piece_id: string
          platform_id: string
          adapted_content: string
          character_count?: number | null
          hashtags?: string[] | null
          mentions?: string[] | null
          media_urls?: string[] | null
          adaptation_rules?: Json
          is_auto_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_piece_id?: string
          platform_id?: string
          adapted_content?: string
          character_count?: number | null
          hashtags?: string[] | null
          mentions?: string[] | null
          media_urls?: string[] | null
          adaptation_rules?: Json
          is_auto_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content_assets: {
        Row: {
          id: string
          content_piece_id: string
          asset_type: 'image' | 'video' | 'gif' | 'document'
          asset_url: string
          asset_name: string | null
          file_size: number | null
          mime_type: string | null
          dimensions: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          content_piece_id: string
          asset_type: 'image' | 'video' | 'gif' | 'document'
          asset_url: string
          asset_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          dimensions?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          content_piece_id?: string
          asset_type?: 'image' | 'video' | 'gif' | 'document'
          asset_url?: string
          asset_name?: string | null
          file_size?: number | null
          mime_type?: string | null
          dimensions?: Json | null
          created_at?: string
        }
      }
      campaign_content: {
        Row: {
          id: string
          campaign_id: string
          content_piece_id: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          content_piece_id: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          content_piece_id?: string
          order_index?: number
          created_at?: string
        }
      }
      campaign_schedules: {
        Row: {
          id: string
          campaign_id: string
          channel_id: string
          scheduled_at: string
          status: 'pending' | 'published' | 'failed' | 'cancelled'
          retry_count: number
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          channel_id: string
          scheduled_at: string
          status?: 'pending' | 'published' | 'failed' | 'cancelled'
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          channel_id?: string
          scheduled_at?: string
          status?: 'pending' | 'published' | 'failed' | 'cancelled'
          retry_count?: number
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      publishing_queue: {
        Row: {
          id: string
          campaign_schedule_id: string
          content_adaptation_id: string
          channel_id: string
          queue_status: 'queued' | 'processing' | 'published' | 'failed' | 'cancelled'
          priority: number
          retry_count: number
          error_message: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_schedule_id: string
          content_adaptation_id: string
          channel_id: string
          queue_status?: 'queued' | 'processing' | 'published' | 'failed' | 'cancelled'
          priority?: number
          retry_count?: number
          error_message?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_schedule_id?: string
          content_adaptation_id?: string
          channel_id?: string
          queue_status?: 'queued' | 'processing' | 'published' | 'failed' | 'cancelled'
          priority?: number
          retry_count?: number
          error_message?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      publishing_history: {
        Row: {
          id: string
          queue_id: string
          platform_post_id: string | null
          platform_response: Json | null
          published_content: string | null
          published_media: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          queue_id: string
          platform_post_id?: string | null
          platform_response?: Json | null
          published_content?: string | null
          published_media?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          queue_id?: string
          platform_post_id?: string | null
          platform_response?: Json | null
          published_content?: string | null
          published_media?: string[] | null
          created_at?: string
        }
      }
      publishing_errors: {
        Row: {
          id: string
          queue_id: string
          error_code: string | null
          error_message: string
          error_details: Json | null
          retry_after: string | null
          created_at: string
        }
        Insert: {
          id?: string
          queue_id: string
          error_code?: string | null
          error_message: string
          error_details?: Json | null
          retry_after?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          queue_id?: string
          error_code?: string | null
          error_message?: string
          error_details?: Json | null
          retry_after?: string | null
          created_at?: string
        }
      }
      content_analytics: {
        Row: {
          id: string
          content_piece_id: string
          channel_id: string
          platform_metrics: Json
          engagement_rate: number | null
          reach_count: number | null
          impression_count: number | null
          click_count: number | null
          like_count: number | null
          share_count: number | null
          comment_count: number | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          content_piece_id: string
          channel_id: string
          platform_metrics?: Json
          engagement_rate?: number | null
          reach_count?: number | null
          impression_count?: number | null
          click_count?: number | null
          like_count?: number | null
          share_count?: number | null
          comment_count?: number | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          content_piece_id?: string
          channel_id?: string
          platform_metrics?: Json
          engagement_rate?: number | null
          reach_count?: number | null
          impression_count?: number | null
          click_count?: number | null
          like_count?: number | null
          share_count?: number | null
          comment_count?: number | null
          recorded_at?: string
          created_at?: string
        }
      }
      platform_analytics: {
        Row: {
          id: string
          channel_id: string
          date: string
          follower_count: number | null
          engagement_rate: number | null
          reach_count: number | null
          impression_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          date: string
          follower_count?: number | null
          engagement_rate?: number | null
          reach_count?: number | null
          impression_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          date?: string
          follower_count?: number | null
          engagement_rate?: number | null
          reach_count?: number | null
          impression_count?: number | null
          created_at?: string
        }
      }
      campaign_analytics: {
        Row: {
          id: string
          campaign_id: string
          total_posts: number
          total_engagement: number
          total_reach: number
          average_engagement_rate: number | null
          best_performing_content: string | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          total_posts?: number
          total_engagement?: number
          total_reach?: number
          average_engagement_rate?: number | null
          best_performing_content?: string | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          total_posts?: number
          total_engagement?: number
          total_reach?: number
          average_engagement_rate?: number | null
          best_performing_content?: string | null
          recorded_at?: string
          created_at?: string
        }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
