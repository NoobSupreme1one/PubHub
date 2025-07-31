-- Insert initial platforms data
INSERT INTO platforms (name, display_name, api_version, is_active, settings) VALUES
('facebook', 'Facebook', 'v18.0', true, '{"oauth_url": "https://www.facebook.com/v18.0/dialog/oauth", "api_base_url": "https://graph.facebook.com/v18.0"}'),
('linkedin', 'LinkedIn', 'v2', true, '{"oauth_url": "https://www.linkedin.com/oauth/v2/authorization", "api_base_url": "https://api.linkedin.com/v2"}'),
('twitter', 'X (Twitter)', 'v2', true, '{"oauth_url": "https://twitter.com/i/oauth2/authorize", "api_base_url": "https://api.twitter.com/2"}'),
('instagram', 'Instagram', 'v18.0', true, '{"oauth_url": "https://www.facebook.com/v18.0/dialog/oauth", "api_base_url": "https://graph.facebook.com/v18.0"}'),
('pinterest', 'Pinterest', 'v5', true, '{"oauth_url": "https://www.pinterest.com/oauth", "api_base_url": "https://api.pinterest.com/v5"}');

-- Insert initial campaign templates
INSERT INTO campaign_templates (name, description, template_type, is_public, settings) VALUES
('B2B Product Launch', 'Template for launching B2B products with thought leadership content and industry insights. Perfect for SaaS companies, enterprise software, and professional services.', 'b2b_launch', true, '{"duration_days": 30, "posts_per_week": 5, "content_mix": {"thought_leadership": 40, "product_features": 30, "customer_stories": 20, "industry_insights": 10}}'),
('Consumer Product Campaign', 'Template for consumer product marketing campaigns with engaging content that drives awareness and conversions. Ideal for e-commerce, retail, and consumer brands.', 'consumer_product', true, '{"duration_days": 21, "posts_per_week": 7, "content_mix": {"product_showcase": 35, "lifestyle_content": 25, "user_generated": 20, "promotional": 20}}'),
('Thought Leadership Series', 'Template for establishing thought leadership in your industry with educational content, insights, and expert perspectives. Great for consultants, agencies, and industry experts.', 'thought_leadership', true, '{"duration_days": 60, "posts_per_week": 3, "content_mix": {"industry_insights": 40, "educational_content": 30, "expert_interviews": 20, "trend_analysis": 10}}'),
('Brand Awareness Campaign', 'Template for building brand awareness and recognition across multiple platforms. Suitable for new brands, rebrands, and market expansion.', 'custom', true, '{"duration_days": 45, "posts_per_week": 4, "content_mix": {"brand_story": 30, "behind_scenes": 25, "community_engagement": 25, "brand_values": 20}}'),
('Event Promotion Campaign', 'Template for promoting events, webinars, conferences, and workshops. Includes pre-event, during-event, and post-event content strategies.', 'custom', true, '{"duration_days": 21, "posts_per_week": 6, "content_mix": {"event_details": 30, "speaker_spotlights": 25, "attendee_engagement": 25, "post_event": 20}}');

-- Create a function to automatically create user settings when a user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user settings
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to sync user data from auth.users
CREATE OR REPLACE FUNCTION sync_user_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync user data from auth.users
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_user_data(); 