import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Icons } from '@/components/ui/icons';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LinkedInService, LinkedInClient } from '@/integrations/linkedin/client';
import { LinkedInProfile, LinkedInCompany } from '@/integrations/linkedin/client';
import { toast } from '@/hooks/use-toast';

const LinkedInConnect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'connect' | 'select' | 'complete'>('connect');
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [companies, setCompanies] = useState<LinkedInCompany[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<{
    profile?: LinkedInProfile;
    companies: LinkedInCompany[];
  }>({ companies: [] });

  const code = searchParams.get('code');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect LinkedIn account. Please try again.',
        variant: 'destructive',
      });
      navigate('/linkedin');
      return;
    }

    if (code) {
      handleOAuthCallback(code);
    }
  }, [code, error]);

  const handleOAuthCallback = async (authCode: string) => {
    try {
      setLoading(true);
      setStep('select');

      // Exchange code for token
      const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_LINKEDIN_CLIENT_SECRET;
      const redirectUri = `${window.location.origin}/linkedin/connect`;

      const tokenResponse = await LinkedInClient.exchangeCodeForToken(
        clientId,
        clientSecret,
        authCode,
        redirectUri
      );

      // Create LinkedIn client
      const client = new LinkedInClient(tokenResponse.access_token);

      // Get user profile
      const userProfile = await client.getProfile();
      setProfile(userProfile);

      // Get companies (if user has admin access)
      try {
        const userCompanies = await client.getCompanies();
        setCompanies(userCompanies);
      } catch (companyError) {
        console.log('No company access or error fetching companies:', companyError);
      }

      // Store tokens temporarily
      sessionStorage.setItem('linkedin_tokens', JSON.stringify({
        access_token: tokenResponse.access_token,
        refresh_token: tokenResponse.refresh_token,
        expires_in: tokenResponse.expires_in,
      }));

    } catch (error) {
      console.error('Error during OAuth callback:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to complete LinkedIn connection. Please try again.',
        variant: 'destructive',
      });
      navigate('/linkedin');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLinkedIn = () => {
    const clientId = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
    const redirectUri = `${window.location.origin}/linkedin/connect`;
    const authUrl = LinkedInClient.getAuthUrl(clientId, redirectUri);
    window.location.href = authUrl;
  };

  const handleAccountSelection = (account: LinkedInProfile | LinkedInCompany, type: 'profile' | 'company') => {
    if (type === 'profile') {
      setSelectedAccounts(prev => ({ ...prev, profile: account as LinkedInProfile }));
    } else {
      const company = account as LinkedInCompany;
      setSelectedAccounts(prev => ({
        ...prev,
        companies: prev.companies.some(c => c.id === company.id)
          ? prev.companies.filter(c => c.id !== company.id)
          : [...prev.companies, company]
      }));
    }
  };

  const handleCompleteConnection = async () => {
    try {
      setLoading(true);

      const tokens = JSON.parse(sessionStorage.getItem('linkedin_tokens') || '{}');
      if (!tokens.access_token) {
        throw new Error('No access token found');
      }

      // Save profile if selected
      if (selectedAccounts.profile) {
        await LinkedInService.saveChannel(
          user!.id,
          selectedAccounts.profile,
          tokens.access_token,
          tokens.refresh_token
        );
      }

      // Save companies if selected
      for (const company of selectedAccounts.companies) {
        await LinkedInService.saveCompanyChannel(
          user!.id,
          company,
          tokens.access_token,
          tokens.refresh_token
        );
      }

      // Clear temporary tokens
      sessionStorage.removeItem('linkedin_tokens');

      setStep('complete');

      toast({
        title: 'Success',
        description: `Successfully connected ${selectedAccounts.profile ? '1' : '0'} profile and ${selectedAccounts.companies.length} company page(s)`,
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate('/linkedin');
      }, 2000);

    } catch (error) {
      console.error('Error completing connection:', error);
      toast({
        title: 'Connection Failed',
        description: 'Failed to save LinkedIn accounts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isAccountSelected = (account: LinkedInProfile | LinkedInCompany, type: 'profile' | 'company') => {
    if (type === 'profile') {
      return selectedAccounts.profile?.id === account.id;
    } else {
      return selectedAccounts.companies.some(c => c.id === account.id);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icons.spinner className="h-8 w-8 animate-spin" />
          <span className="ml-2">
            {step === 'connect' ? 'Connecting to LinkedIn...' : 'Processing accounts...'}
          </span>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Icons.checkCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-xl font-semibold mb-2">Connection Successful!</h3>
            <p className="text-muted-foreground mb-4">
              Your LinkedIn accounts have been successfully connected to PubHub.
            </p>
            <Button onClick={() => navigate('/linkedin')} className="w-full">
              Go to LinkedIn Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Connect LinkedIn Accounts</h1>
            <p className="text-muted-foreground">
              Select which LinkedIn accounts you'd like to connect to PubHub
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Profile */}
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icons.user className="mr-2 h-5 w-5" />
                    Personal Profile
                  </CardTitle>
                  <CardDescription>
                    Your LinkedIn personal profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      isAccountSelected(profile, 'profile')
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAccountSelection(profile, 'profile')}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profilePicture} />
                        <AvatarFallback>
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Personal Profile
                        </p>
                      </div>
                      {isAccountSelected(profile, 'profile') && (
                        <Icons.check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Company Pages */}
            {companies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Icons.building className="mr-2 h-5 w-5" />
                    Company Pages
                  </CardTitle>
                  <CardDescription>
                    Company pages you have admin access to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          isAccountSelected(company, 'company')
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleAccountSelection(company, 'company')}
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={company.logoUrl} />
                            <AvatarFallback>
                              {company.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{company.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {company.industry || 'Company Page'}
                            </p>
                            {company.followerCount && (
                              <p className="text-xs text-muted-foreground">
                                {company.followerCount.toLocaleString()} followers
                              </p>
                            )}
                          </div>
                          {isAccountSelected(company, 'company') && (
                            <Icons.check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate('/linkedin')}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteConnection}
              disabled={
                !selectedAccounts.profile && selectedAccounts.companies.length === 0
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Icons.linkedin className="mr-2 h-4 w-4" />
              Connect Selected Accounts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Initial connect step
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <Icons.linkedin className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold mb-2">Connect LinkedIn</h3>
            <p className="text-muted-foreground mb-6">
              Connect your LinkedIn profile and company pages to start publishing professional content
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span className="text-sm">Publish to personal profile</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span className="text-sm">Publish to company pages</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span className="text-sm">View analytics and insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Icons.check className="h-5 w-5 text-green-600" />
                <span className="text-sm">Optimize content for LinkedIn</span>
              </div>
            </div>

            <Button
              onClick={handleConnectLinkedIn}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Icons.linkedin className="mr-2 h-4 w-4" />
              Connect with LinkedIn
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              By connecting, you authorize PubHub to access your LinkedIn profile and company pages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LinkedInConnect; 