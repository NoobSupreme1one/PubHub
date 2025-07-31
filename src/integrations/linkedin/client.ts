import { supabase } from '../supabase/client';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  email?: string;
}

export interface LinkedInCompany {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  followerCount?: number;
  industry?: string;
}

export interface LinkedInPost {
  id: string;
  text: string;
  media?: LinkedInMedia[];
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
  publishedAt?: string;
  status: 'draft' | 'published' | 'scheduled';
}

export interface LinkedInMedia {
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string;
  description?: string;
}

export interface LinkedInAnalytics {
  impressions: number;
  clicks: number;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: number;
}

export class LinkedInClient {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';
  private marketingUrl = 'https://api.linkedin.com/v2/adAnalytics';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // OAuth Flow Methods
  static getAuthUrl(clientId: string, redirectUri: string, scopes: string[] = ['r_liteprofile', 'w_member_social', 'r_organization_social', 'w_organization_social']): string {
    const scopeString = scopes.join(' ');
    return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopeString)}&state=${this.generateState()}`;
  }

  static async exchangeCodeForToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn OAuth error: ${response.statusText}`);
    }

    return response.json();
  }

  static async refreshToken(clientId: string, clientSecret: string, refreshToken: string): Promise<{ access_token: string; expires_in: number; refresh_token?: string }> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn token refresh error: ${response.statusText}`);
    }

    return response.json();
  }

  // Profile Methods
  async getProfile(): Promise<LinkedInProfile> {
    const response = await fetch(`${this.baseUrl}/me`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn profile: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      firstName: data.localizedFirstName,
      lastName: data.localizedLastName,
      profilePicture: data.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
    };
  }

  async getEmail(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/emailAddress?q=members&projection=(elements*(handle~))`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn email: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements?.[0]?.['handle~']?.emailAddress;
  }

  // Company Methods
  async getCompanies(): Promise<LinkedInCompany[]> {
    const response = await fetch(`${this.baseUrl}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(id,name,logoV2,description,industry,specialties,followerCount)))`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn companies: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements?.map((element: any) => ({
      id: element['organizationalTarget~'].id,
      name: element['organizationalTarget~'].name,
      description: element['organizationalTarget~'].description,
      logoUrl: element['organizationalTarget~'].logoV2?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      followerCount: element['organizationalTarget~'].followerCount,
      industry: element['organizationalTarget~'].industry,
    })) || [];
  }

  async getCompanyFollowers(companyId: string): Promise<number> {
    const response = await fetch(`${this.baseUrl}/organizations/${companyId}?projection=(id,followerCount)`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch company followers: ${response.statusText}`);
    }

    const data = await response.json();
    return data.followerCount || 0;
  }

  // Posting Methods
  async createPersonalPost(post: Omit<LinkedInPost, 'id' | 'publishedAt'>): Promise<{ id: string }> {
    const postData = {
      author: `urn:li:person:${await this.getProfile().then(p => p.id)}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.text,
          },
          shareMediaCategory: post.media?.length ? 'IMAGE' : 'NONE',
          media: post.media?.map(media => ({
            status: 'READY',
            description: {
              text: media.description || '',
            },
            media: media.type === 'image' ? media.url : undefined,
            title: {
              text: media.title || '',
            },
          })),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': post.visibility,
      },
    };

    const response = await fetch(`${this.baseUrl}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create LinkedIn post: ${error}`);
    }

    const data = await response.json();
    return { id: data.id };
  }

  async createCompanyPost(companyId: string, post: Omit<LinkedInPost, 'id' | 'publishedAt'>): Promise<{ id: string }> {
    const postData = {
      author: `urn:li:organization:${companyId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.text,
          },
          shareMediaCategory: post.media?.length ? 'IMAGE' : 'NONE',
          media: post.media?.map(media => ({
            status: 'READY',
            description: {
              text: media.description || '',
            },
            media: media.type === 'image' ? media.url : undefined,
            title: {
              text: media.title || '',
            },
          })),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': post.visibility,
      },
    };

    const response = await fetch(`${this.baseUrl}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create LinkedIn company post: ${error}`);
    }

    const data = await response.json();
    return { id: data.id };
  }

  async getPosts(authorId: string, isCompany: boolean = false): Promise<LinkedInPost[]> {
    const author = isCompany ? `urn:li:organization:${authorId}` : `urn:li:person:${authorId}`;
    
    const response = await fetch(`${this.baseUrl}/ugcPosts?authors=List(${author})&count=50`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn posts: ${response.statusText}`);
    }

    const data = await response.json();
    return data.elements?.map((element: any) => ({
      id: element.id,
      text: element.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
      visibility: element.visibility?.['com.linkedin.ugc.MemberNetworkVisibility'],
      publishedAt: element.created.time,
      status: element.lifecycleState === 'PUBLISHED' ? 'published' : 'draft',
    })) || [];
  }

  // Analytics Methods
  async getPostAnalytics(postId: string): Promise<LinkedInAnalytics> {
    const response = await fetch(`${this.marketingUrl}?pivots=List(SHARE)&timeGranularity=DAY&shares=List(urn%3Ali%3Ashare%3A${postId})&fields=List(impressions,clicks,likes,comments,shares)`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch LinkedIn post analytics: ${response.statusText}`);
    }

    const data = await response.json();
    const metrics = data.elements?.[0] || {};
    
    return {
      impressions: metrics.impressions || 0,
      clicks: metrics.clicks || 0,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      engagementRate: metrics.engagementRate || 0,
    };
  }

  // Content Optimization Methods
  async getOptimalPostingTimes(authorId: string, isCompany: boolean = false): Promise<{ day: string; time: string; engagementRate: number }[]> {
    // This would typically use LinkedIn's analytics API to determine optimal posting times
    // For now, we'll return common best practices
    return [
      { day: 'Tuesday', time: '10:00', engagementRate: 0.85 },
      { day: 'Wednesday', time: '10:00', engagementRate: 0.82 },
      { day: 'Thursday', time: '10:00', engagementRate: 0.80 },
      { day: 'Tuesday', time: '14:00', engagementRate: 0.78 },
      { day: 'Wednesday', time: '14:00', engagementRate: 0.76 },
    ];
  }

  async suggestHashtags(content: string): Promise<string[]> {
    // This would typically use LinkedIn's hashtag suggestions API
    // For now, we'll return common B2B hashtags
    const commonHashtags = [
      '#business', '#marketing', '#leadership', '#innovation', '#technology',
      '#entrepreneurship', '#growth', '#strategy', '#digitalmarketing', '#b2b'
    ];
    
    // Simple keyword matching for now
    const keywords = content.toLowerCase().split(' ');
    const suggested = commonHashtags.filter(hashtag => 
      keywords.some(keyword => hashtag.toLowerCase().includes(keyword.replace('#', '')))
    );
    
    return suggested.length > 0 ? suggested : commonHashtags.slice(0, 3);
  }

  async optimizeContent(content: string, targetAudience: string = 'B2B'): Promise<{
    optimizedText: string;
    suggestedHashtags: string[];
    characterCount: number;
    estimatedEngagement: number;
  }> {
    const hashtags = await this.suggestHashtags(content);
    const optimizedText = `${content}\n\n${hashtags.join(' ')}`;
    
    return {
      optimizedText,
      suggestedHashtags: hashtags,
      characterCount: optimizedText.length,
      estimatedEngagement: Math.min(0.95, Math.max(0.1, 0.3 + (hashtags.length * 0.05))),
    };
  }

  // Utility Methods
  private static generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
export const LinkedInService = {
  async saveChannel(userId: string, profile: LinkedInProfile, accessToken: string, refreshToken?: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_channels')
      .insert({
        user_id: userId,
        platform_id: await this.getLinkedInPlatformId(),
        channel_name: `${profile.firstName} ${profile.lastName}`,
        channel_id: profile.id,
        channel_type: 'profile',
        display_name: `${profile.firstName} ${profile.lastName}`,
        avatar_url: profile.profilePicture,
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
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        scopes: ['r_liteprofile', 'w_member_social', 'r_organization_social', 'w_organization_social'],
      });

    return data.id;
  },

  async saveCompanyChannel(userId: string, company: LinkedInCompany, accessToken: string, refreshToken?: string): Promise<string> {
    const { data, error } = await supabase
      .from('user_channels')
      .insert({
        user_id: userId,
        platform_id: await this.getLinkedInPlatformId(),
        channel_name: company.name,
        channel_id: company.id,
        channel_type: 'company',
        display_name: company.name,
        avatar_url: company.logoUrl,
        follower_count: company.followerCount,
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
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        scopes: ['r_liteprofile', 'w_member_social', 'r_organization_social', 'w_organization_social'],
      });

    return data.id;
  },

  async getLinkedInPlatformId(): Promise<string> {
    const { data, error } = await supabase
      .from('platforms')
      .select('id')
      .eq('name', 'linkedin')
      .single();

    if (error) throw error;
    return data.id;
  },

  async getUserChannels(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_channels')
      .select(`
        *,
        platform:platforms(name, display_name),
        tokens:channel_tokens(access_token, refresh_token, expires_at)
      `)
      .eq('user_id', userId)
      .eq('platforms.name', 'linkedin');

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
}; 