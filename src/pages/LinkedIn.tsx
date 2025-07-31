import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { LinkedInService, LinkedInClient } from '@/integrations/linkedin/client';
import { LinkedInProfile, LinkedInCompany, LinkedInPost } from '@/integrations/linkedin/client';
import { toast } from '@/hooks/use-toast';

interface ConnectedChannel {
  id: string;
  channel_name: string;
  channel_type: 'profile' | 'company';
  display_name: string;
  avatar_url?: string;
  follower_count?: number;
  status: string;
  platform: {
    name: string;
    display_name: string;
  };
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }[];
}

const LinkedIn: React.FC = () => {
  const { user } = useAuth();
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<ConnectedChannel | null>(null);
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadConnectedChannels();
    }
  }, [user]);

  const loadConnectedChannels = async () => {
    try {
      setLoading(true);
      const channels = await LinkedInService.getUserChannels(user!.id);
      setConnectedChannels(channels);
      
      if (channels.length > 0) {
        setSelectedChannel(channels[0]);
        await loadChannelData(channels[0]);
      }
    } catch (error) {
      console.error('Error loading LinkedIn channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load LinkedIn channels',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannelData = async (channel: ConnectedChannel) => {
    try {
      const client = new LinkedInClient(channel.tokens[0].access_token);
      
      // Load posts
      const channelPosts = await client.getPosts(channel.channel_id, channel.channel_type === 'company');
      setPosts(channelPosts);

      // Load analytics (simplified for now)
      setAnalytics({
        totalPosts: channelPosts.length,
        totalEngagement: channelPosts.reduce((sum, post) => sum + (post.status === 'published' ? 1 : 0), 0),
        averageEngagement: channelPosts.length > 0 ? 0.75 : 0,
      });
    } catch (error) {
      console.error('Error loading channel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load channel data',
        variant: 'destructive',
      });
    }
  };

  const handleChannelSelect = async (channel: ConnectedChannel) => {
    setSelectedChannel(channel);
    await loadChannelData(channel);
  };

  const handleConnectLinkedIn = () => {
    // This would redirect to LinkedIn OAuth
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/linkedin/callback`;
    const authUrl = LinkedInClient.getAuthUrl(clientId, redirectUri);
    window.location.href = authUrl;
  };

  const handleDisconnectChannel = async (channelId: string) => {
    try {
      await LinkedInService.updateChannelStatus(channelId, 'disconnected');
      await loadConnectedChannels();
      toast({
        title: 'Success',
        description: 'LinkedIn account disconnected',
      });
    } catch (error) {
      console.error('Error disconnecting channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to disconnect LinkedIn account',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'disconnected':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading LinkedIn integration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LinkedIn Integration</h1>
        <p className="text-muted-foreground">
          Connect your LinkedIn accounts and manage your professional content
        </p>
      </div>

      {connectedChannels.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.linkedin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">No LinkedIn accounts connected</h3>
            <p className="text-muted-foreground mb-6">
              Connect your LinkedIn profile or company page to start publishing content
            </p>
            <Button onClick={handleConnectLinkedIn} className="bg-blue-600 hover:bg-blue-700">
              <Icons.linkedin className="mr-2 h-4 w-4" />
              Connect LinkedIn Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connected Accounts */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Icons.linkedin className="mr-2 h-5 w-5" />
                  Connected Accounts
                </CardTitle>
                <CardDescription>
                  Your LinkedIn profiles and company pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedChannels.map((channel) => (
                    <div
                      key={channel.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedChannel?.id === channel.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleChannelSelect(channel)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={channel.avatar_url} />
                          <AvatarFallback>
                            {channel.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {channel.display_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {channel.channel_type === 'company' ? 'Company Page' : 'Personal Profile'}
                          </p>
                          {channel.follower_count && (
                            <p className="text-xs text-muted-foreground">
                              {channel.follower_count.toLocaleString()} followers
                            </p>
                          )}
                        </div>
                        <Badge className={getStatusColor(channel.status)}>
                          {channel.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  onClick={handleConnectLinkedIn}
                  variant="outline"
                  className="w-full mt-4"
                >
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Another Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedChannel ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="publish">Publish</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {selectedChannel.follower_count?.toLocaleString() || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {analytics?.averageEngagement ? `${(analytics.averageEngagement * 100).toFixed(1)}%` : '0%'}
                          </p>
                          <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button className="w-full">
                          <Icons.edit className="mr-2 h-4 w-4" />
                          Create Post
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Icons.barChart className="mr-2 h-4 w-4" />
                          View Analytics
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Icons.settings className="mr-2 h-4 w-4" />
                          Account Settings
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700"
                          onClick={() => handleDisconnectChannel(selectedChannel.id)}
                        >
                          <Icons.unlink className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="posts" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {posts.length === 0 ? (
                        <div className="text-center py-8">
                          <Icons.fileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No posts found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {posts.slice(0, 5).map((post) => (
                            <div key={post.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {new Date(post.publishedAt || '').toLocaleDateString()}
                                  </p>
                                  <p className="text-sm line-clamp-3">{post.text}</p>
                                  <Badge variant="secondary" className="mt-2">
                                    {post.visibility}
                                  </Badge>
                                </div>
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                  {post.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Icons.barChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Analytics coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="publish" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Publish Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Icons.edit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Publishing interface coming soon</p>
                        <Button className="mt-4">
                          <Icons.plus className="mr-2 h-4 w-4" />
                          Create New Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Icons.linkedin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">Select an account</h3>
                  <p className="text-muted-foreground">
                    Choose a LinkedIn account from the sidebar to view details and manage content
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkedIn; 