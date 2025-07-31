import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { LinkedInService, LinkedInClient } from '@/integrations/linkedin/client';
import { LinkedInPost, LinkedInMedia } from '@/integrations/linkedin/client';
import { toast } from '@/hooks/use-toast';

interface ConnectedChannel {
  id: string;
  channel_name: string;
  channel_type: 'profile' | 'company';
  display_name: string;
  avatar_url?: string;
  follower_count?: number;
  status: string;
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_at: string;
  }[];
}

const LinkedInPublish: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connectedChannels, setConnectedChannels] = useState<ConnectedChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<ConnectedChannel | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Content state
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN'>('PUBLIC');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [characterCount, setCharacterCount] = useState(0);
  const [estimatedEngagement, setEstimatedEngagement] = useState(0);

  // Media state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  // Optimization state
  const [showOptimization, setShowOptimization] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (user) {
      loadConnectedChannels();
    }
  }, [user]);

  useEffect(() => {
    setCharacterCount(content.length);
  }, [content]);

  const loadConnectedChannels = async () => {
    try {
      setLoading(true);
      const channels = await LinkedInService.getUserChannels(user!.id);
      setConnectedChannels(channels);
      
      if (channels.length > 0) {
        setSelectedChannel(channels[0]);
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

  const handleContentChange = (value: string) => {
    setContent(value);
    setOptimizedContent(value);
  };

  const handleOptimizeContent = async () => {
    if (!content.trim() || !selectedChannel) return;

    try {
      setOptimizing(true);
      const client = new LinkedInClient(selectedChannel.tokens[0].access_token);
      
      const optimization = await client.optimizeContent(content, 'B2B');
      
      setOptimizedContent(optimization.optimizedText);
      setSuggestedHashtags(optimization.suggestedHashtags);
      setSelectedHashtags(optimization.suggestedHashtags);
      setCharacterCount(optimization.characterCount);
      setEstimatedEngagement(optimization.estimatedEngagement);
      setShowOptimization(true);
      
      toast({
        title: 'Content Optimized',
        description: 'Your content has been optimized for LinkedIn',
      });
    } catch (error) {
      console.error('Error optimizing content:', error);
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleHashtagToggle = (hashtag: string) => {
    setSelectedHashtags(prev => 
      prev.includes(hashtag)
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setMediaFiles(prev => [...prev, ...files]);
      
      // Create preview URLs
      files.forEach(file => {
        const url = URL.createObjectURL(file);
        setMediaUrls(prev => [...prev, url]);
      });
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!selectedChannel || !content.trim()) {
      toast({
        title: 'Missing Content',
        description: 'Please enter content to publish',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPublishing(true);

      const client = new LinkedInClient(selectedChannel.tokens[0].access_token);
      
      // Prepare media if any
      const media: LinkedInMedia[] = mediaFiles.map((file, index) => ({
        type: file.type.startsWith('image/') ? 'image' : 'document',
        url: mediaUrls[index],
        title: file.name,
        description: '',
      }));

      // Prepare final content
      const finalContent = includeHashtags && selectedHashtags.length > 0
        ? `${content}\n\n${selectedHashtags.join(' ')}`
        : content;

      const post: Omit<LinkedInPost, 'id' | 'publishedAt'> = {
        text: finalContent,
        media: media.length > 0 ? media : undefined,
        visibility,
        status: 'draft',
      };

      // Publish based on channel type
      let result;
      if (selectedChannel.channel_type === 'company') {
        result = await client.createCompanyPost(selectedChannel.channel_id, post);
      } else {
        result = await client.createPersonalPost(post);
      }

      toast({
        title: 'Published Successfully',
        description: 'Your LinkedIn post has been published',
      });

      // Reset form
      setContent('');
      setOptimizedContent('');
      setSelectedHashtags([]);
      setMediaFiles([]);
      setMediaUrls([]);
      setShowOptimization(false);

      // Navigate back to LinkedIn dashboard
      setTimeout(() => {
        navigate('/linkedin');
      }, 1500);

    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: 'Publishing Failed',
        description: 'Failed to publish post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setPublishing(false);
    }
  };

  const getCharacterCountColor = () => {
    if (characterCount > 3000) return 'text-red-600';
    if (characterCount > 2500) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading LinkedIn channels...</span>
        </div>
      </div>
    );
  }

  if (connectedChannels.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.linkedin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">No LinkedIn accounts connected</h3>
            <p className="text-muted-foreground mb-6">
              Connect your LinkedIn account to start publishing content
            </p>
            <Button onClick={() => navigate('/linkedin/connect')} className="bg-blue-600 hover:bg-blue-700">
              <Icons.linkedin className="mr-2 h-4 w-4" />
              Connect LinkedIn Account
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Publish to LinkedIn</h1>
        <p className="text-muted-foreground">
          Create and publish professional content to your LinkedIn accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Publishing Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Account</CardTitle>
              <CardDescription>
                Choose which LinkedIn account to publish from
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
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={channel.avatar_url} />
                        <AvatarFallback>
                          {channel.display_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{channel.display_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {channel.channel_type === 'company' ? 'Company Page' : 'Personal Profile'}
                        </p>
                      </div>
                      {selectedChannel?.id === channel.id && (
                        <Icons.check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your Post</CardTitle>
              <CardDescription>
                Write engaging content for your LinkedIn audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Share your thoughts, insights, or updates..."
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[200px]"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-sm ${getCharacterCountColor()}`}>
                    {characterCount} / 3000 characters
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOptimizeContent}
                    disabled={!content.trim() || optimizing}
                  >
                    {optimizing ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icons.sparkles className="h-4 w-4" />
                    )}
                    {optimizing ? 'Optimizing...' : 'Optimize'}
                  </Button>
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <Label>Media (Optional)</Label>
                <div className="mt-2">
                  <Input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleMediaUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: Images, PDFs, Documents (max 5 files)
                  </p>
                </div>
                
                {mediaUrls.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <img
                          src={url}
                          alt={`Media ${index + 1}`}
                          className="h-12 w-12 object-cover rounded"
                        />
                        <span className="flex-1 text-sm">{mediaFiles[index].name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedia(index)}
                        >
                          <Icons.x className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Visibility Settings */}
              <div>
                <Label>Post Visibility</Label>
                <Select value={visibility} onValueChange={(value: any) => setVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">Public</SelectItem>
                    <SelectItem value="CONNECTIONS">Connections</SelectItem>
                    <SelectItem value="LOGGED_IN">Logged-in users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Publish Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handlePublish}
                disabled={!selectedChannel || !content.trim() || publishing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {publishing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Icons.linkedin className="mr-2 h-4 w-4" />
                    Publish to LinkedIn
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Optimization Panel */}
        <div className="space-y-6">
          {/* Content Optimization */}
          {showOptimization && (
            <Card>
              <CardHeader>
                <CardTitle>Content Optimization</CardTitle>
                <CardDescription>
                  AI-powered suggestions for better engagement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Optimized Content</Label>
                  <Textarea
                    value={optimizedContent}
                    onChange={(e) => setOptimizedContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div>
                  <Label>Suggested Hashtags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestedHashtags.map((hashtag) => (
                      <Badge
                        key={hashtag}
                        variant={selectedHashtags.includes(hashtag) ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => handleHashtagToggle(hashtag)}
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="include-hashtags"
                    checked={includeHashtags}
                    onCheckedChange={setIncludeHashtags}
                  />
                  <Label htmlFor="include-hashtags">Include hashtags in post</Label>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{characterCount}</p>
                    <p className="text-xs text-muted-foreground">Characters</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(estimatedEngagement * 100).toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Est. Engagement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Optimal Length</p>
                  <p className="text-xs text-muted-foreground">1,300 characters for maximum engagement</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Best Posting Times</p>
                  <p className="text-xs text-muted-foreground">Tuesday-Thursday, 9-11 AM or 1-3 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Hashtags</p>
                  <p className="text-xs text-muted-foreground">3-5 relevant hashtags for better reach</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Icons.check className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Professional Tone</p>
                  <p className="text-xs text-muted-foreground">Keep content professional and valuable</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LinkedInPublish; 