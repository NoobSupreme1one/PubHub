# 🗄️ PubHub Database Schema Design

## Overview
This document outlines the complete database schema for PubHub, a social media management platform that enables content creators to repurpose blog articles across multiple platforms.

## Core Entities

### 1. Users & Authentication
- **users** - Extended user profiles
- **user_settings** - User preferences and configuration
- **user_organizations** - Multi-tenant support for organizations

### 2. Campaign Management
- **campaigns** - Main campaign entity
- **campaign_templates** - Reusable campaign templates
- **campaign_content** - Content associated with campaigns
- **campaign_schedules** - Scheduling information

### 3. Platform Integration
- **platforms** - Supported social media platforms
- **user_channels** - Connected social media accounts
- **channel_tokens** - OAuth tokens and credentials
- **channel_permissions** - Platform-specific permissions

### 4. Content Management
- **content_pieces** - Individual content items
- **content_adaptations** - Platform-specific content versions
- **content_assets** - Images, videos, and other media
- **content_analytics** - Performance tracking

### 5. Publishing & Scheduling
- **publishing_queue** - Queue for scheduled posts
- **publishing_history** - Historical publishing records
- **publishing_errors** - Error tracking and retry logic

### 6. Analytics & Performance
- **platform_analytics** - Platform-specific metrics
- **campaign_analytics** - Campaign performance data
- **content_performance** - Content engagement metrics

## Detailed Schema

### Users & Authentication

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  auto_save_enabled BOOLEAN DEFAULT true,
  default_timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_organizations
```sql
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campaign Management

#### campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES campaign_templates(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived')),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### campaign_templates
```sql
CREATE TABLE campaign_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL CHECK (template_type IN ('b2b_launch', 'consumer_product', 'thought_leadership', 'custom')),
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### campaign_content
```sql
CREATE TABLE campaign_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  content_piece_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### campaign_schedules
```sql
CREATE TABLE campaign_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Platform Integration

#### platforms
```sql
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon_url TEXT,
  api_version TEXT,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### user_channels
```sql
CREATE TABLE user_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  channel_name TEXT NOT NULL,
  channel_id TEXT NOT NULL, -- Platform-specific ID
  channel_type TEXT NOT NULL, -- 'page', 'profile', 'group', etc.
  display_name TEXT,
  avatar_url TEXT,
  follower_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error', 'expired')),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform_id, channel_id)
);
```

#### channel_tokens
```sql
CREATE TABLE channel_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### channel_permissions
```sql
CREATE TABLE channel_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  permission_name TEXT NOT NULL,
  is_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, permission_name)
);
```

### Content Management

#### content_pieces
```sql
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'blog_post' CHECK (content_type IN ('blog_post', 'article', 'social_post', 'custom')),
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### content_adaptations
```sql
CREATE TABLE content_adaptations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_piece_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  adapted_content TEXT NOT NULL,
  character_count INTEGER,
  hashtags TEXT[],
  mentions TEXT[],
  media_urls TEXT[],
  adaptation_rules JSONB DEFAULT '{}',
  is_auto_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_piece_id, platform_id)
);
```

#### content_assets
```sql
CREATE TABLE content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_piece_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'video', 'gif', 'document')),
  asset_url TEXT NOT NULL,
  asset_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  dimensions JSONB, -- {width: 1920, height: 1080}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### content_analytics
```sql
CREATE TABLE content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_piece_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  platform_metrics JSONB DEFAULT '{}',
  engagement_rate DECIMAL(5,4),
  reach_count INTEGER,
  impression_count INTEGER,
  click_count INTEGER,
  like_count INTEGER,
  share_count INTEGER,
  comment_count INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Publishing & Scheduling

#### publishing_queue
```sql
CREATE TABLE publishing_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_schedule_id UUID REFERENCES campaign_schedules(id) ON DELETE CASCADE,
  content_adaptation_id UUID REFERENCES content_adaptations(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  queue_status TEXT DEFAULT 'queued' CHECK (queue_status IN ('queued', 'processing', 'published', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### publishing_history
```sql
CREATE TABLE publishing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES publishing_queue(id) ON DELETE CASCADE,
  platform_post_id TEXT, -- Platform's post ID
  platform_response JSONB,
  published_content TEXT,
  published_media TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### publishing_errors
```sql
CREATE TABLE publishing_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID REFERENCES publishing_queue(id) ON DELETE CASCADE,
  error_code TEXT,
  error_message TEXT NOT NULL,
  error_details JSONB,
  retry_after TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Analytics & Performance

#### platform_analytics
```sql
CREATE TABLE platform_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES user_channels(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  follower_count INTEGER,
  engagement_rate DECIMAL(5,4),
  reach_count INTEGER,
  impression_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, date)
);
```

#### campaign_analytics
```sql
CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  total_posts INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  average_engagement_rate DECIMAL(5,4),
  best_performing_content UUID REFERENCES content_pieces(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes for Performance

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Campaigns
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_start_date ON campaigns(start_date);

-- User Channels
CREATE INDEX idx_user_channels_user_id ON user_channels(user_id);
CREATE INDEX idx_user_channels_platform_id ON user_channels(platform_id);
CREATE INDEX idx_user_channels_status ON user_channels(status);

-- Content
CREATE INDEX idx_content_pieces_user_id ON content_pieces(user_id);
CREATE INDEX idx_content_pieces_content_type ON content_pieces(content_type);

-- Publishing Queue
CREATE INDEX idx_publishing_queue_status ON publishing_queue(queue_status);
CREATE INDEX idx_publishing_queue_priority ON publishing_queue(priority);
CREATE INDEX idx_publishing_queue_created_at ON publishing_queue(created_at);

-- Analytics
CREATE INDEX idx_content_analytics_content_piece_id ON content_analytics(content_piece_id);
CREATE INDEX idx_content_analytics_channel_id ON content_analytics(channel_id);
CREATE INDEX idx_platform_analytics_channel_date ON platform_analytics(channel_id, date);
```

## Row Level Security (RLS) Policies

### Users
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Campaigns
```sql
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);
```

### User Channels
```sql
ALTER TABLE user_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own channels" ON user_channels
  FOR ALL USING (auth.uid() = user_id);
```

### Content Pieces
```sql
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own content" ON content_pieces
  FOR ALL USING (auth.uid() = user_id);
```

## Triggers for Data Integrity

### Updated At Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (apply to all relevant tables)
```

## Initial Data

### Platforms
```sql
INSERT INTO platforms (name, display_name, api_version, is_active) VALUES
('facebook', 'Facebook', 'v18.0', true),
('linkedin', 'LinkedIn', 'v2', true),
('twitter', 'X (Twitter)', 'v2', true),
('instagram', 'Instagram', 'v18.0', true),
('pinterest', 'Pinterest', 'v5', true);
```

### Campaign Templates
```sql
INSERT INTO campaign_templates (name, description, template_type, is_public, settings) VALUES
('B2B Product Launch', 'Template for launching B2B products with thought leadership content', 'b2b_launch', true, '{"duration_days": 30, "posts_per_week": 5}'),
('Consumer Product Campaign', 'Template for consumer product marketing campaigns', 'consumer_product', true, '{"duration_days": 21, "posts_per_week": 7}'),
('Thought Leadership Series', 'Template for establishing thought leadership in your industry', 'thought_leadership', true, '{"duration_days": 60, "posts_per_week": 3}');
```

## Notes

1. **UUIDs**: All primary keys use UUIDs for better distribution and security
2. **Timestamps**: All tables include created_at and updated_at for audit trails
3. **JSONB**: Used for flexible metadata storage
4. **Enums**: Platform-specific status values are enforced at the database level
5. **RLS**: Row Level Security ensures users can only access their own data
6. **Indexes**: Strategic indexing for common query patterns
7. **Triggers**: Automatic updated_at maintenance
8. **Foreign Keys**: Proper referential integrity with cascade deletes where appropriate

This schema provides a solid foundation for the PubHub MVP while maintaining flexibility for future enhancements. 