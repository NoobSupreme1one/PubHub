-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings policies
CREATE POLICY "Users can manage own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- User organizations policies
CREATE POLICY "Users can manage own organizations" ON user_organizations
  FOR ALL USING (auth.uid() = user_id);

-- Platforms policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view platforms" ON platforms
  FOR SELECT USING (auth.role() = 'authenticated');

-- User channels policies
CREATE POLICY "Users can manage own channels" ON user_channels
  FOR ALL USING (auth.uid() = user_id);

-- Channel tokens policies
CREATE POLICY "Users can manage own channel tokens" ON channel_tokens
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_channels 
      WHERE user_channels.id = channel_tokens.channel_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Channel permissions policies
CREATE POLICY "Users can manage own channel permissions" ON channel_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_channels 
      WHERE user_channels.id = channel_permissions.channel_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Campaign templates policies
CREATE POLICY "Users can view public templates" ON campaign_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own templates" ON campaign_templates
  FOR ALL USING (auth.uid() = created_by);

-- Campaigns policies
CREATE POLICY "Users can manage own campaigns" ON campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Content pieces policies
CREATE POLICY "Users can manage own content" ON content_pieces
  FOR ALL USING (auth.uid() = user_id);

-- Content adaptations policies
CREATE POLICY "Users can manage own content adaptations" ON content_adaptations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM content_pieces 
      WHERE content_pieces.id = content_adaptations.content_piece_id 
      AND content_pieces.user_id = auth.uid()
    )
  );

-- Content assets policies
CREATE POLICY "Users can manage own content assets" ON content_assets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM content_pieces 
      WHERE content_pieces.id = content_assets.content_piece_id 
      AND content_pieces.user_id = auth.uid()
    )
  );

-- Campaign content policies
CREATE POLICY "Users can manage own campaign content" ON campaign_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_content.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Campaign schedules policies
CREATE POLICY "Users can manage own campaign schedules" ON campaign_schedules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_schedules.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Publishing queue policies
CREATE POLICY "Users can manage own publishing queue" ON publishing_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_channels 
      WHERE user_channels.id = publishing_queue.channel_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Publishing history policies
CREATE POLICY "Users can view own publishing history" ON publishing_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM publishing_queue 
      JOIN user_channels ON user_channels.id = publishing_queue.channel_id
      WHERE publishing_queue.id = publishing_history.queue_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Publishing errors policies
CREATE POLICY "Users can view own publishing errors" ON publishing_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM publishing_queue 
      JOIN user_channels ON user_channels.id = publishing_queue.channel_id
      WHERE publishing_queue.id = publishing_errors.queue_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Content analytics policies
CREATE POLICY "Users can view own content analytics" ON content_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM content_pieces 
      WHERE content_pieces.id = content_analytics.content_piece_id 
      AND content_pieces.user_id = auth.uid()
    )
  );

-- Platform analytics policies
CREATE POLICY "Users can view own platform analytics" ON platform_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_channels 
      WHERE user_channels.id = platform_analytics.channel_id 
      AND user_channels.user_id = auth.uid()
    )
  );

-- Campaign analytics policies
CREATE POLICY "Users can view own campaign analytics" ON campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_analytics.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  ); 