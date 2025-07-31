import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useFacebookIntegration } from '@/hooks/use-facebook-integration';
import { 
  Facebook, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Users,
  Globe,
  Settings
} from 'lucide-react';

interface FacebookConnectionProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

export const FacebookConnection: React.FC<FacebookConnectionProps> = ({ 
  onConnectionChange 
}) => {
  const {
    isInitialized,
    isConnected,
    isLoading,
    user,
    pages,
    error,
    connect,
    disconnect,
    refreshPages,
  } = useFacebookIntegration();

  const [showPages, setShowPages] = useState(false);

  // Notify parent component of connection changes
  React.useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowPages(false);
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  const handleRefreshPages = async () => {
    try {
      await refreshPages();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  if (!isInitialized) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Initializing Facebook SDK...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Facebook className="h-6 w-6 text-[#1877F2]" />
          <CardTitle>Facebook Integration</CardTitle>
          {isConnected && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Connect your Facebook account to publish content to your Facebook pages
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>To connect your Facebook account, you'll need to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Grant permission to manage your Facebook pages</li>
                <li>Allow posting content on your behalf</li>
                <li>Access basic page information and analytics</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="w-full bg-[#1877F2] hover:bg-[#166FE5] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="h-4 w-4 mr-2" />
                  Connect Facebook Account
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* User Info */}
            {user && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-[#1877F2] rounded-full flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {user.email && (
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </div>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  {pages.length} page{pages.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            )}

            {/* Pages Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  Connected Pages ({pages.length})
                </h4>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshPages}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPages(!showPages)}
                  >
                    {showPages ? 'Hide' : 'Show'} Pages
                  </Button>
                </div>
              </div>

              {showPages && pages.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-[#1877F2] rounded-full flex items-center justify-center">
                          <Facebook className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{page.name}</p>
                          <p className="text-xs text-muted-foreground">{page.category}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {showPages && pages.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pages found</p>
                  <p className="text-xs">Make sure you have admin access to Facebook pages</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                <p>Connection active</p>
                <p className="text-xs">You can now publish content to your Facebook pages</p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* TODO: Open settings */}}
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
