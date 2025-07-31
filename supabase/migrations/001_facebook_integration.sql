-- Create tables for Facebook integration

-- Table to store Facebook user access tokens
CREATE TABLE facebook_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    access_token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Table to store Facebook pages associated with users
CREATE TABLE facebook_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    page_id TEXT NOT NULL,
    page_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, page_id)
);

-- Table to store posted content for tracking and analytics
CREATE TABLE facebook_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    page_id TEXT NOT NULL,
    facebook_post_id TEXT NOT NULL,
    message TEXT,
    link TEXT,
    picture TEXT,
    status_type TEXT,
    scheduled_publish_time TIMESTAMP WITH TIME ZONE,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facebook_post_id)
);

-- Table to store post analytics and engagement data
CREATE TABLE facebook_post_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES facebook_posts(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id)
);

-- Create indexes for better performance
CREATE INDEX idx_facebook_tokens_user_id ON facebook_tokens(user_id);
CREATE INDEX idx_facebook_tokens_expires_at ON facebook_tokens(expires_at);
CREATE INDEX idx_facebook_pages_user_id ON facebook_pages(user_id);
CREATE INDEX idx_facebook_pages_page_id ON facebook_pages(page_id);
CREATE INDEX idx_facebook_posts_user_id ON facebook_posts(user_id);
CREATE INDEX idx_facebook_posts_page_id ON facebook_posts(page_id);
CREATE INDEX idx_facebook_posts_published_at ON facebook_posts(published_at);
CREATE INDEX idx_facebook_post_analytics_post_id ON facebook_post_analytics(post_id);

-- Enable Row Level Security (RLS)
ALTER TABLE facebook_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE facebook_post_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to ensure users can only access their own data
CREATE POLICY "Users can only access their own Facebook tokens" ON facebook_tokens
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own Facebook pages" ON facebook_pages
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own Facebook posts" ON facebook_posts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access analytics for their own posts" ON facebook_post_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM facebook_posts 
            WHERE facebook_posts.id = facebook_post_analytics.post_id 
            AND facebook_posts.user_id = auth.uid()
        )
    );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_facebook_tokens_updated_at 
    BEFORE UPDATE ON facebook_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_pages_updated_at 
    BEFORE UPDATE ON facebook_pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facebook_posts_updated_at 
    BEFORE UPDATE ON facebook_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_facebook_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM facebook_tokens WHERE expires_at < NOW();
    DELETE FROM facebook_pages WHERE user_id NOT IN (SELECT user_id FROM facebook_tokens);
END;
$$ language 'plpgsql';

-- Create a scheduled job to clean up expired tokens (runs daily)
-- Note: This requires the pg_cron extension to be enabled
-- SELECT cron.schedule('cleanup-expired-facebook-tokens', '0 2 * * *', 'SELECT cleanup_expired_facebook_tokens();');
