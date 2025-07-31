import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FacebookService, FacebookClient } from '@/integrations/facebook/client';
import { FacebookProfile, FacebookPage } from '@/integrations/facebook/client';
import { toast } from '@/hooks/use-toast';

interface SelectedAccounts {
  profile: FacebookProfile | null;
  pages: FacebookPage[];
}

const FacebookConnect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'connect' | 'select'>('connect');
  const [profile, setProfile] = useState<FacebookProfile | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccounts>({
    profile: null,
    pages: [],
  });

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast({
        title: 'Connection Failed',
        description: 'Facebook connection was cancelled or failed.',
        variant: 'destructive',
      });
      navigate('/facebook');
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, [searchParams, navigate]);

  const handleOAuthCallback = async (authCode: string) => {
    try {
      setLoading(true);
      setStep('select');

      // Exchange code for token
      const redirectUri = `${window.location.origin}/facebook/connect`;

      const tokenResponse = await FacebookClient.exchangeCodeForToken(
        authCode,
        redirectUri
      );

      // Get long-lived token
      const longLivedTokenResponse = await FacebookClient.getLongLivedToken(
        tokenResponse.access_token
      );

      // Create Facebook client
      const client = new FacebookClient(longLivedTokenResponse.access_token);

      // Get user profile
      const userProfile = await client.getProfile();
      setProfile(userProfile);

      // Get pages (if user has page access)
      try {
        const userPages = await client.getPages();
        setPages(userPages);
      } catch (pageError) {
        console.log('No page access or error fetching pages:', pageError);
      }

      // Store tokens temporarily
      sessionStorage.setItem('facebook_tokens', JSON.stringify({
        access_token: longLivedTokenResponse.access_token,
        expires_in: longLivedTokenResponse.expires_in,
      }));

    } catch (error) {
      console.error('Error during OAuth callback:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to complete Facebook connection. Please try again.',
        variant: 'destructive',
      });
      navigate('/facebook');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectFacebook = () => {
    try {
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

  const handleProfileSelect = (checked: boolean) => {
    setSelectedAccounts(prev => ({
      ...prev,
      profile: checked ? profile : null,
    }));
  };

  const handlePageSelect = (page: FacebookPage, checked: boolean) => {
    setSelectedAccounts(prev => ({
      ...prev,
      pages: checked
        ? [...prev.pages, page]
        : prev.pages.filter(p => p.id !== page.id),
    }));
  };

  const handleCompleteConnection = async () => {
    try {
      setLoading(true);

      const tokens = JSON.parse(sessionStorage.getItem('facebook_tokens') || '{}');
      if (!tokens.access_token) {
        throw new Error('No access token found');
      }

      // Save profile if selected
      if (selectedAccounts.profile) {
        await FacebookService.saveChannel(
          user!.id,
          selectedAccounts.profile,
          tokens.access_token
        );
      }

      // Save pages if selected
      for (const page of selectedAccounts.pages) {
        await FacebookService.savePageChannel(
          user!.id,
          page,
          tokens.access_token
        );
      }

      // Clean up temporary tokens
      sessionStorage.removeItem('facebook_tokens');

      toast({
        title: 'Success',
        description: 'Facebook accounts connected successfully!',
      });

      navigate('/facebook');
    } catch (error) {
      console.error('Error completing connection:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to save Facebook connection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">Connecting to Facebook...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">Connect Facebook</h1>
          <p className="text-muted-foreground">
            Connect your Facebook profile and company pages to start publishing content
          </p>
        </div>

        {step === 'connect' ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Icons.facebook className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Connect Your Facebook Account</CardTitle>
              <CardDescription>
                Authorize PubHub to access your Facebook profile and pages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Icons.check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Connection</p>
                    <p className="text-sm text-muted-foreground">
                      We use Facebook's official OAuth2 flow to securely connect your account
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icons.check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Page Management</p>
                    <p className="text-sm text-muted-foreground">
                      Publish posts to your Facebook pages and manage content
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Icons.check className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Analytics Access</p>
                    <p className="text-sm text-muted-foreground">
                      View insights and performance metrics for your posts
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleConnectFacebook} className="w-full" size="lg">
                  <Icons.facebook className="h-5 w-5 mr-2" />
                  Connect with Facebook
                </Button>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => navigate('/facebook')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Select Accounts to Connect</CardTitle>
              <CardDescription>
                Choose which Facebook accounts you want to connect to PubHub
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Selection */}
              {profile && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Personal Profile</h3>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id="profile"
                      checked={selectedAccounts.profile !== null}
                      onCheckedChange={handleProfileSelect}
                    />
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={profile.picture?.data?.url} />
                      <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                      <Badge variant="secondary">Profile</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Pages Selection */}
              {pages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Facebook Pages</h3>
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                        <Checkbox
                          id={`page-${page.id}`}
                          checked={selectedAccounts.pages.some(p => p.id === page.id)}
                          onCheckedChange={(checked) => handlePageSelect(page, checked as boolean)}
                        />
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={page.picture?.data?.url} />
                          <AvatarFallback>{page.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-muted-foreground">{page.category}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="default">Page</Badge>
                            {page.fan_count && (
                              <span className="text-sm text-muted-foreground">
                                {page.fan_count.toLocaleString()} followers
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCompleteConnection}
                  disabled={!selectedAccounts.profile && selectedAccounts.pages.length === 0}
                  className="flex-1"
                >
                  Connect Selected Accounts
                </Button>
                <Button variant="outline" onClick={() => navigate('/facebook')}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FacebookConnect;
