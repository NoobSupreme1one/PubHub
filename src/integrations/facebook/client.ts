import { supabase } from '../supabase/client';
import { config } from '@/lib/config';

export interface FacebookProfile {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface FacebookPage {
  id: string;
  name: string;
  category: string;
  access_token: string;
  picture?: {
    data: {
      url: string;
    };
  };
  fan_count?: number;
  about?: string;
}

export interface FacebookPost {
  id: string;
  message: string;
  link?: string;
  picture?: string;
  name?: string;
  caption?: string;
  description?: string;
  privacy?: {
    value: 'EVERYONE' | 'ALL_FRIENDS' | 'FRIENDS_OF_FRIENDS' | 'SELF' | 'CUSTOM';
  };
  published?: boolean;
  scheduled_publish_time?: number;
  status: 'draft' | 'published' | 'scheduled';
}

export interface FacebookMedia {
  type: 'photo' | 'video';
  url: string;
  caption?: string;
}

export interface FacebookAnalytics {
  impressions: number;
  reach: number;
  engagement: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
}

export class FacebookClient {
  private accessToken: string;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Configuration helper
  static getConfig() {
    const fbConfig = config.platforms.facebook;
    if (!fbConfig.enabled) {
      throw new Error('Facebook integration is not enabled. Please configure VITE_FACEBOOK_APP_ID and VITE_FACEBOOK_APP_SECRET environment variables.');
    }
    return fbConfig;
  }

  // OAuth Flow Methods
  static getAuthUrl(redirectUri: string, scopes: string[] = ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile', 'email']): string {
    const fbConfig = this.getConfig();
    const scopeString = scopes.join(',');
    const state = this.generateState();
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbConfig.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeString)}&state=${state}&response_type=code`;
  }

  static async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ access_token: string; token_type: string; expires_in?: number }> {
    const fbConfig = this.getConfig();
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: fbConfig.appId,
        client_secret: fbConfig.appSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook OAuth error: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  static async getLongLivedToken(shortLivedToken: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const fbConfig = this.getConfig();
    const response = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${fbConfig.appId}&client_secret=${fbConfig.appSecret}&fb_exchange_token=${shortLivedToken}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook token exchange error: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Profile Methods
  async getProfile(): Promise<FacebookProfile> {
    const response = await fetch(`${this.baseUrl}/me?fields=id,name,email,picture`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Facebook profile: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Page Methods
  async getPages(): Promise<FacebookPage[]> {
    const response = await fetch(`${this.baseUrl}/me/accounts?fields=id,name,category,access_token,picture,fan_count,about`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Facebook pages: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async getPageInfo(pageId: string): Promise<FacebookPage> {
    const response = await fetch(`${this.baseUrl}/${pageId}?fields=id,name,category,picture,fan_count,about`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Facebook page info: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Posting Methods
  async createPost(pageId: string, pageAccessToken: string, post: Omit<FacebookPost, 'id' | 'status'>): Promise<{ id: string }> {
    const postData: any = {
      message: post.message,
      published: post.published !== false,
    };

    if (post.link) {
      postData.link = post.link;
    }

    if (post.picture) {
      postData.picture = post.picture;
    }

    if (post.name) {
      postData.name = post.name;
    }

    if (post.caption) {
      postData.caption = post.caption;
    }

    if (post.description) {
      postData.description = post.description;
    }

    if (post.scheduled_publish_time) {
      postData.scheduled_publish_time = post.scheduled_publish_time;
      postData.published = false;
    }

    const response = await fetch(`${this.baseUrl}/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create Facebook post: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async uploadPhoto(pageId: string, pageAccessToken: string, photoUrl: string, caption?: string): Promise<{ id: string }> {
    const postData: any = {
      url: photoUrl,
      published: false, // Upload as unpublished first
    };

    if (caption) {
      postData.caption = caption;
    }

    const response = await fetch(`${this.baseUrl}/${pageId}/photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload Facebook photo: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  async createPhotoPost(pageId: string, pageAccessToken: string, photoId: string, message?: string): Promise<{ id: string }> {
    const postData: any = {
      attached_media: [{ media_fbid: photoId }],
      published: true,
    };

    if (message) {
      postData.message = message;
    }

    const response = await fetch(`${this.baseUrl}/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create Facebook photo post: ${errorData.error?.message || response.statusText}`);
    }

    return response.json();
  }

  // Get Posts
  async getPosts(pageId: string, pageAccessToken: string, limit: number = 25): Promise<FacebookPost[]> {
    const response = await fetch(`${this.baseUrl}/${pageId}/posts?fields=id,message,link,picture,name,caption,description,created_time,is_published&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Facebook posts: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return (data.data || []).map((post: any) => ({
      id: post.id,
      message: post.message || '',
      link: post.link,
      picture: post.picture,
      name: post.name,
      caption: post.caption,
      description: post.description,
      status: post.is_published ? 'published' : 'draft',
    }));
  }

  // Analytics Methods
  async getPostInsights(postId: string, pageAccessToken: string): Promise<FacebookAnalytics> {
    const metrics = ['post_impressions', 'post_reach', 'post_engaged_users', 'post_clicks', 'post_reactions_by_type_total', 'post_comments', 'post_shares'];
    const response = await fetch(`${this.baseUrl}/${postId}/insights?metric=${metrics.join(',')}`, {
      headers: {
        'Authorization': `Bearer ${pageAccessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch Facebook post insights: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const insights = data.data || [];

    const analytics: FacebookAnalytics = {
      impressions: 0,
      reach: 0,
      engagement: 0,
      clicks: 0,
      reactions: 0,
      comments: 0,
      shares: 0,
    };

    insights.forEach((insight: any) => {
      const value = insight.values?.[0]?.value || 0;
      switch (insight.name) {
        case 'post_impressions':
          analytics.impressions = value;
          break;
        case 'post_reach':
          analytics.reach = value;
          break;
        case 'post_engaged_users':
          analytics.engagement = value;
          break;
        case 'post_clicks':
          analytics.clicks = value;
          break;
        case 'post_reactions_by_type_total':
          analytics.reactions = Object.values(value || {}).reduce((sum: number, count: any) => sum + count, 0);
          break;
        case 'post_comments':
          analytics.comments = value;
          break;
        case 'post_shares':
          analytics.shares = value;
          break;
      }
    });

    return analytics;
  }

  async validateToken(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Database integration methods
export const FacebookService = {
  async saveChannel(userId: string, profile: FacebookProfile, accessToken: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_channels')
      .insert({
        user_id: userId,
        platform_id: await this.getFacebookPlatformId(),
        channel_name: profile.name,
        channel_id: profile.id,
        channel_type: 'profile',
        display_name: profile.name,
        avatar_url: profile.picture?.data?.url,
        status: 'connected',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Save tokens
    await supabase
      .from('channel_tokens')
      .insert({
        channel_id: data.id,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list', 'public_profile', 'email'],
      });

    return data.id;
  },

  async savePageChannel(userId: string, page: FacebookPage, userAccessToken: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_channels')
      .insert({
        user_id: userId,
        platform_id: await this.getFacebookPlatformId(),
        channel_name: page.name,
        channel_id: page.id,
        channel_type: 'page',
        display_name: page.name,
        avatar_url: page.picture?.data?.url,
        follower_count: page.fan_count,
        status: 'connected',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Save page access token (never expires for pages)
    await supabase
      .from('channel_tokens')
      .insert({
        channel_id: data.id,
        access_token: page.access_token,
        token_type: 'Bearer',
        scopes: ['pages_manage_posts', 'pages_read_engagement'],
      });

    return data.id;
  },

  async getFacebookPlatformId(): Promise<string> {
    const { data, error } = await supabase
      .from('platforms')
      .select('id')
      .eq('name', 'facebook')
      .single();

    if (error) throw error;
    return data.id;
  },

  async getConnectedChannels(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_channels')
      .select(`
        *,
        platform:platforms(*),
        tokens:channel_tokens(*)
      `)
      .eq('user_id', userId)
      .eq('platforms.name', 'facebook')
      .eq('status', 'connected');

    if (error) throw error;
    return data || [];
  },

  async updateChannelStatus(channelId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('user_channels')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', channelId);

    if (error) throw error;
  },

  async refreshPageToken(channelId: string, newAccessToken: string): Promise<void> {
    const { error } = await supabase
      .from('channel_tokens')
      .update({
        access_token: newAccessToken,
        updated_at: new Date().toISOString()
      })
      .eq('channel_id', channelId);

    if (error) throw error;
  },
};
