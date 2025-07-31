import { useState, useEffect, useCallback } from 'react';
import { facebookService, FacebookUser, FacebookPage, FacebookPostRequest } from '@/lib/facebook-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export interface FacebookIntegrationState {
  isInitialized: boolean;
  isConnected: boolean;
  isLoading: boolean;
  user: FacebookUser | null;
  pages: FacebookPage[];
  error: string | null;
}

export interface UseFacebookIntegrationReturn extends FacebookIntegrationState {
  initialize: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  postToPage: (pageId: string, postData: FacebookPostRequest) => Promise<void>;
  refreshPages: () => Promise<void>;
  checkConnectionStatus: () => Promise<void>;
}

export const useFacebookIntegration = (): UseFacebookIntegrationReturn => {
  const [state, setState] = useState<FacebookIntegrationState>({
    isInitialized: false,
    isConnected: false,
    isLoading: false,
    user: null,
    pages: [],
    error: null,
  });

  // Initialize Facebook SDK
  const initialize = useCallback(async () => {
    if (state.isInitialized) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await facebookService.initialize();
      setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));
      
      // Check if user is already connected
      await checkConnectionStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Facebook SDK';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast.error('Facebook initialization failed', {
        description: errorMessage
      });
    }
  }, [state.isInitialized]);

  // Check connection status
  const checkConnectionStatus = useCallback(async () => {
    if (!state.isInitialized) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check stored credentials first
      const storedCredentials = await facebookService.getStoredCredentials(user.id);
      
      if (storedCredentials) {
        // Verify the token is still valid by getting user info
        try {
          const loginStatus = await facebookService.getLoginStatus();
          if (loginStatus.status === 'connected') {
            const userInfo = await facebookService.getUserInfo();
            setState(prev => ({
              ...prev,
              isConnected: true,
              user: userInfo,
              pages: storedCredentials.pages,
            }));
            return;
          }
        } catch (error) {
          // Token might be expired, remove stored credentials
          await facebookService.removeCredentials(user.id);
        }
      }

      // Check Facebook login status
      const loginStatus = await facebookService.getLoginStatus();
      if (loginStatus.status === 'connected') {
        const userInfo = await facebookService.getUserInfo();
        const pages = await facebookService.getUserPages();
        
        // Store credentials
        await facebookService.storeCredentials(user.id, loginStatus.authResponse.accessToken, pages);
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          user: userInfo,
          pages,
        }));
      } else {
        setState(prev => ({
          ...prev,
          isConnected: false,
          user: null,
          pages: [],
        }));
      }
    } catch (error) {
      console.error('Error checking Facebook connection status:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        user: null,
        pages: [],
      }));
    }
  }, [state.isInitialized]);

  // Connect to Facebook
  const connect = useCallback(async () => {
    if (!state.isInitialized) {
      toast.error('Facebook SDK not initialized');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Request Facebook login with required permissions
      const loginResponse = await facebookService.login([
        'pages_manage_posts',
        'pages_read_engagement',
        'pages_show_list',
        'publish_to_groups'
      ]);

      if (loginResponse.status === 'connected') {
        const userInfo = await facebookService.getUserInfo();
        const pages = await facebookService.getUserPages();

        // Store credentials securely
        await facebookService.storeCredentials(
          user.id, 
          loginResponse.authResponse.accessToken, 
          pages
        );

        setState(prev => ({
          ...prev,
          isConnected: true,
          isLoading: false,
          user: userInfo,
          pages,
        }));

        toast.success('Successfully connected to Facebook!', {
          description: `Connected ${pages.length} page(s)`
        });
      } else {
        throw new Error('Facebook login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Facebook';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage,
        isConnected: false,
        user: null,
        pages: []
      }));
      toast.error('Facebook connection failed', {
        description: errorMessage
      });
    }
  }, [state.isInitialized]);

  // Disconnect from Facebook
  const disconnect = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await facebookService.removeCredentials(user.id);
      }

      await facebookService.logout();

      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        user: null,
        pages: [],
      }));

      toast.success('Successfully disconnected from Facebook');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from Facebook';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast.error('Disconnection failed', {
        description: errorMessage
      });
    }
  }, []);

  // Post to a Facebook page
  const postToPage = useCallback(async (pageId: string, postData: FacebookPostRequest) => {
    if (!state.isConnected) {
      toast.error('Not connected to Facebook');
      return;
    }

    const page = state.pages.find(p => p.id === pageId);
    if (!page) {
      toast.error('Page not found');
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await facebookService.postToPage(pageId, page.access_token, postData);

      // Store post record in database
      await supabase.from('facebook_posts').insert({
        user_id: user.id,
        page_id: pageId,
        facebook_post_id: result.id,
        message: postData.message || null,
        link: postData.link || null,
        picture: postData.picture || null,
        status_type: result.status_type || null,
        scheduled_publish_time: postData.scheduled_publish_time 
          ? new Date(postData.scheduled_publish_time * 1000).toISOString()
          : null,
        published_at: postData.published !== false ? new Date().toISOString() : null,
      });

      setState(prev => ({ ...prev, isLoading: false }));

      toast.success('Post published successfully!', {
        description: `Posted to ${page.name}`
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to post to Facebook';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast.error('Post failed', {
        description: errorMessage
      });
    }
  }, [state.isConnected, state.pages]);

  // Refresh pages list
  const refreshPages = useCallback(async () => {
    if (!state.isConnected) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const pages = await facebookService.getUserPages();
      
      // Update stored pages
      const loginStatus = await facebookService.getLoginStatus();
      if (loginStatus.status === 'connected') {
        await facebookService.storeCredentials(user.id, loginStatus.authResponse.accessToken, pages);
      }

      setState(prev => ({
        ...prev,
        pages,
        isLoading: false,
      }));

      toast.success('Pages refreshed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh pages';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      toast.error('Failed to refresh pages', {
        description: errorMessage
      });
    }
  }, [state.isConnected]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    initialize,
    connect,
    disconnect,
    postToPage,
    refreshPages,
    checkConnectionStatus,
  };
};
