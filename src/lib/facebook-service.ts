import { supabase } from '@/integrations/supabase/client';

// Facebook API Types
export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks?: string[];
}

export interface FacebookPost {
  id: string;
  message?: string;
  link?: string;
  picture?: string;
  created_time: string;
  status_type: string;
}

export interface FacebookPostRequest {
  message?: string;
  link?: string;
  picture?: string;
  scheduled_publish_time?: number;
  published?: boolean;
}

export interface FacebookError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
}

// Facebook Service Class
export class FacebookService {
  private static instance: FacebookService;
  private isInitialized = false;
  private appId: string;
  private version = 'v18.0';

  private constructor() {
    this.appId = import.meta.env.VITE_FACEBOOK_APP_ID || '';
    if (!this.appId) {
      console.warn('Facebook App ID not found in environment variables');
    }
  }

  public static getInstance(): FacebookService {
    if (!FacebookService.instance) {
      FacebookService.instance = new FacebookService();
    }
    return FacebookService.instance;
  }

  // Initialize Facebook SDK
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      return new Promise((resolve, reject) => {
        // Load Facebook SDK
        window.fbAsyncInit = () => {
          if (!window.FB) {
            reject(new Error('Facebook SDK failed to load'));
            return;
          }

          window.FB.init({
            appId: this.appId,
            cookie: true,
            xfbml: true,
            version: this.version,
          });

          this.isInitialized = true;
          resolve();
        };

        // Load the SDK asynchronously
        const script = document.createElement('script');
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Facebook SDK initialization failed:', error);
      throw new Error('Failed to initialize Facebook SDK');
    }
  }

  // Check login status
  public async getLoginStatus(): Promise<fb.StatusResponse> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      window.FB.getLoginStatus((response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Login with Facebook
  public async login(permissions: string[] = ['pages_manage_posts', 'pages_read_engagement']): Promise<fb.StatusResponse> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      window.FB.login((response) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('Facebook login failed or was cancelled'));
        }
      }, { scope: permissions.join(',') });
    });
  }

  // Logout
  public async logout(): Promise<void> {
    await this.ensureInitialized();
    
    return new Promise((resolve) => {
      window.FB.logout(() => {
        resolve();
      });
    });
  }

  // Get user information
  public async getUserInfo(): Promise<FacebookUser> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      window.FB.api('/me', { fields: 'id,name,email' }, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response as FacebookUser);
        }
      });
    });
  }

  // Get user's pages
  public async getUserPages(): Promise<FacebookPage[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      window.FB.api('/me/accounts', { fields: 'id,name,access_token,category,tasks' }, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.data as FacebookPage[]);
        }
      });
    });
  }

  // Post to a Facebook page
  public async postToPage(pageId: string, pageAccessToken: string, postData: FacebookPostRequest): Promise<FacebookPost> {
    await this.ensureInitialized();
    
    // Validate input
    if (!pageId || !pageAccessToken) {
      throw new Error('Page ID and access token are required');
    }

    if (!postData.message && !postData.link && !postData.picture) {
      throw new Error('Post must contain at least a message, link, or picture');
    }

    // Sanitize message content
    if (postData.message) {
      postData.message = this.sanitizeContent(postData.message);
    }

    return new Promise((resolve, reject) => {
      const endpoint = `/${pageId}/feed`;
      const params = {
        ...postData,
        access_token: pageAccessToken,
      };

      window.FB.api(endpoint, 'POST', params, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response as FacebookPost);
        }
      });
    });
  }

  // Get page posts
  public async getPagePosts(pageId: string, pageAccessToken: string, limit = 10): Promise<FacebookPost[]> {
    await this.ensureInitialized();
    
    return new Promise((resolve, reject) => {
      const endpoint = `/${pageId}/posts`;
      const params = {
        fields: 'id,message,link,picture,created_time,status_type',
        limit,
        access_token: pageAccessToken,
      };

      window.FB.api(endpoint, params, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.data as FacebookPost[]);
        }
      });
    });
  }

  // Store Facebook credentials securely in Supabase
  public async storeCredentials(userId: string, accessToken: string, pages: FacebookPage[]): Promise<void> {
    try {
      // Store user access token
      const { error: tokenError } = await supabase
        .from('facebook_tokens')
        .upsert({
          user_id: userId,
          access_token: accessToken,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
          updated_at: new Date().toISOString(),
        });

      if (tokenError) throw tokenError;

      // Store page tokens
      for (const page of pages) {
        const { error: pageError } = await supabase
          .from('facebook_pages')
          .upsert({
            user_id: userId,
            page_id: page.id,
            page_name: page.name,
            access_token: page.access_token,
            category: page.category,
            updated_at: new Date().toISOString(),
          });

        if (pageError) throw pageError;
      }
    } catch (error) {
      console.error('Error storing Facebook credentials:', error);
      throw new Error('Failed to store Facebook credentials');
    }
  }

  // Get stored credentials
  public async getStoredCredentials(userId: string): Promise<{ token: string; pages: FacebookPage[] } | null> {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('facebook_tokens')
        .select('access_token, expires_at')
        .eq('user_id', userId)
        .single();

      if (tokenError || !tokenData) return null;

      // Check if token is expired
      if (new Date(tokenData.expires_at) < new Date()) {
        return null;
      }

      const { data: pagesData, error: pagesError } = await supabase
        .from('facebook_pages')
        .select('page_id, page_name, access_token, category')
        .eq('user_id', userId);

      if (pagesError) throw pagesError;

      const pages: FacebookPage[] = pagesData.map(page => ({
        id: page.page_id,
        name: page.page_name,
        access_token: page.access_token,
        category: page.category,
      }));

      return {
        token: tokenData.access_token,
        pages,
      };
    } catch (error) {
      console.error('Error retrieving Facebook credentials:', error);
      return null;
    }
  }

  // Remove stored credentials
  public async removeCredentials(userId: string): Promise<void> {
    try {
      await Promise.all([
        supabase.from('facebook_tokens').delete().eq('user_id', userId),
        supabase.from('facebook_pages').delete().eq('user_id', userId),
      ]);
    } catch (error) {
      console.error('Error removing Facebook credentials:', error);
      throw new Error('Failed to remove Facebook credentials');
    }
  }

  // Private helper methods
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private sanitizeContent(content: string): string {
    // Basic content sanitization
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim()
      .substring(0, 63206); // Facebook post character limit
  }
}

// Export singleton instance
export const facebookService = FacebookService.getInstance();

// Extend Window interface for Facebook SDK
declare global {
  interface Window {
    FB: typeof fb;
    fbAsyncInit: () => void;
  }
}
