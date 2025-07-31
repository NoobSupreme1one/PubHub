import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { FacebookService, FacebookClient } from '@/integrations/facebook/client';
import { FacebookProfile, FacebookPage, FacebookPost } from '@/integrations/facebook/client';
import { toast } from '@/hooks/use-toast';

interface ConnectedChannel {
  id: string;
  channel_name: string;
  channel_type: 'profile' | 'page';
  display_name: string;
  avatar_url?: string;
  follower_count?: number;
  status: string;
  tokens: {
    access_token: string;
    expires_at?: string;
  }[];
}

interface FacebookAnalytics {
  totalPosts: number;
  totalEngagement: number;
  averageEngagement: number;
}

const Facebook: React.FC = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ConnectedChannel | null>(null);
  const [posts, setPosts] = useState<FacebookPost[]>([]);
  const [analytics, setAnalytics] = useState<FacebookAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConnectedChannels();
    }
  }, [user]);

  const loadConnectedChannels = async () => {
    try {
      setLoading(true);
      const connectedChannels = await FacebookService.getConnectedChannels(user!.id);
      setChannels(connectedChannels);
      
      if (connectedChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(connectedChannels[0]);
        await loadChannelData(connectedChannels[0]);
      }
    } catch (error) {
      console.error('Error loading connected channels:', error);
      toast({
        title: 'Error',
        description: 'Failed to load connected Facebook accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannelData = async (channel: ConnectedChannel) => {
    try {
      const client = new FacebookClient(channel.tokens[0].access_token);
      
      // Load posts
      let channelPosts: FacebookPost[] = [];
      if (channel.channel_type === 'page') {
        channelPosts = await client.getPosts(channel.channel_id, channel.tokens[0].access_token);
      }
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

  const handleConnectFacebook = () => {
    try {
      // This would redirect to Facebook OAuth
      const redirectUri = `${window.location.origin}/facebook/connect`;
      const authUrl = FacebookClient.getAuthUrl(redirectUri);
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error initiating Facebook connection:', error);
      toast({
        title: 'Configuration Error',
        description: 'Facebook integration is not properly configured. Please check your environment variables.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Facebook channels...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facebook Integration</h1>
          <p className="text-muted-foreground">
            Connect your Facebook pages and manage your social media presence
          </p>
        </div>
        <Button onClick={handleConnectFacebook} className="flex items-center gap-2">
          <Icons.facebook className="h-4 w-4" />
          Connect Facebook Account
        </Button>
      </div>

      {channels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.facebook className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Facebook accounts connected</h3>
            <p className="text-muted-foreground text-center mb-4">
              Connect your Facebook account to start managing your pages and posts
            </p>
            <Button onClick={handleConnectFacebook} className="flex items-center gap-2">
              <Icons.facebook className="h-4 w-4" />
              Connect Facebook Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Connected Accounts */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.facebook className="h-5 w-5" />
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedChannel?.id === channel.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleChannelSelect(channel)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={channel.avatar_url} />
                        <AvatarFallback>
                          {channel.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.display_name}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant={channel.channel_type === 'page' ? 'default' : 'secondary'}>
                            {channel.channel_type}
                          </Badge>
                          <Badge variant={channel.status === 'connected' ? 'default' : 'destructive'}>
                            {channel.status}
                          </Badge>
                        </div>
                        {channel.follower_count && (
                          <p className="text-sm text-muted-foreground">
                            {channel.follower_count.toLocaleString()} followers
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectFacebook}
                  className="w-full"
                >
                  <Icons.plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedChannel ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="publish">Publish</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedChannel.avatar_url} />
                          <AvatarFallback>
                            {selectedChannel.display_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{selectedChannel.display_name}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant={selectedChannel.channel_type === 'page' ? 'default' : 'secondary'}>
                              {selectedChannel.channel_type}
                            </Badge>
                            <Badge variant={selectedChannel.status === 'connected' ? 'default' : 'destructive'}>
                              {selectedChannel.status}
                            </Badge>
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedChannel.follower_count && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{selectedChannel.follower_count.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{analytics?.totalPosts || 0}</p>
                            <p className="text-sm text-muted-foreground">Posts</p>
                          </div>
                          <div className="text-center p-4 bg-muted/50 rounded-lg">
                            <p className="text-2xl font-bold">{Math.round((analytics?.averageEngagement || 0) * 100)}%</p>
                            <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="posts" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Posts</CardTitle>
                      <CardDescription>
                        Your recent Facebook posts and their performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {posts.length === 0 ? (
                        <div className="text-center py-8">
                          <Icons.fileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No posts found</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {posts.slice(0, 10).map((post) => (
                            <div key={post.id} className="border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-medium mb-2">{post.message}</p>
                                  {post.link && (
                                    <a
                                      href={post.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-sm"
                                    >
                                      {post.link}
                                    </a>
                                  )}
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

                <TabsContent value="analytics" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analytics Overview</CardTitle>
                      <CardDescription>
                        Performance metrics for your Facebook content
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Icons.barChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Analytics coming soon</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="publish" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Publish to Facebook</CardTitle>
                      <CardDescription>
                        Create and publish content to your Facebook page
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Button onClick={() => window.location.href = '/facebook/publish'}>
                          <Icons.plus className="h-4 w-4 mr-2" />
                          Create New Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">Select a Facebook account to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Facebook;
