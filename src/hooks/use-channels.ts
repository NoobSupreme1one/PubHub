import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface Channel {
  id: string;
  name: string;
  platform: string;
  icon: React.ReactNode;
  color: string;
  stats: {
    followers: string;
    scheduledPosts: number;
    engagement: string;
  };
  status: 'connected' | 'disconnected' | 'error';
}

export function useChannels() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['channels', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Fetch Facebook pages
      const { data: facebookPages, error: facebookError } = await supabase
        .from('facebook_pages')
        .select('*')
        .eq('user_id', user.id);

      if (facebookError) {
        console.error('Error fetching Facebook pages:', facebookError);
      }

      // TODO: Add other platform integrations here
      // const { data: linkedinPages } = await supabase.from('linkedin_pages')...
      // const { data: twitterAccounts } = await supabase.from('twitter_accounts')...

      const channels: Channel[] = [];

      // Add Facebook channels
      if (facebookPages) {
        facebookPages.forEach(page => {
          channels.push({
            id: `facebook-${page.page_id}`,
            name: page.page_name,
            platform: 'Meta Business',
            icon: null, // Will be set in the component
            color: '#1877F2',
            stats: {
              followers: '0', // TODO: Fetch real stats from Facebook API
              scheduledPosts: 0, // TODO: Count scheduled posts
              engagement: '0%' // TODO: Calculate engagement
            },
            status: 'connected'
          });
        });
      }

      // Add default channels if no real connections exist
      if (channels.length === 0) {
        // Return mock data for demo purposes
        return [
          {
            id: 'blog',
            name: 'Company Blog',
            platform: 'WordPress',
            icon: null,
            color: '#1976D2',
            stats: {
              followers: '2.4K',
              scheduledPosts: 5,
              engagement: '4.2%'
            },
            status: 'disconnected' as const
          },
          {
            id: 'facebook',
            name: 'Facebook Page',
            platform: 'Meta Business',
            icon: null,
            color: '#1877F2',
            stats: {
              followers: '12.5K',
              scheduledPosts: 8,
              engagement: '3.8%'
            },
            status: 'disconnected' as const
          },
          {
            id: 'linkedin',
            name: 'LinkedIn Company',
            platform: 'LinkedIn Business',
            icon: null,
            color: '#0A66C2',
            stats: {
              followers: '8.9K',
              scheduledPosts: 3,
              engagement: '6.1%'
            },
            status: 'disconnected' as const
          },
          {
            id: 'twitter',
            name: 'X (Twitter)',
            platform: 'X Corp',
            icon: null,
            color: '#000000',
            stats: {
              followers: '15.2K',
              scheduledPosts: 12,
              engagement: '2.9%'
            },
            status: 'disconnected' as const
          },
          {
            id: 'instagram',
            name: 'Instagram Business',
            platform: 'Meta Business',
            icon: null,
            color: '#E4405F',
            stats: {
              followers: '6.7K',
              scheduledPosts: 6,
              engagement: '5.4%'
            },
            status: 'disconnected' as const
          },
          {
            id: 'pinterest',
            name: 'Pinterest Business',
            platform: 'Pinterest',
            icon: null,
            color: '#BD081C',
            stats: {
              followers: '3.1K',
              scheduledPosts: 2,
              engagement: '7.2%'
            },
            status: 'disconnected' as const
          }
        ];
      }

      return channels;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
