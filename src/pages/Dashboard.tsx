import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ChannelCard } from "@/components/dashboard/ChannelCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Globe,
  Facebook,
  Linkedin,
  Twitter,
  Instagram,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  Loader2
} from "lucide-react"
import { useChannels } from "@/hooks/use-channels"

const getChannelIcon = (id: string, color: string) => {
  const iconProps = { className: "h-5 w-5", style: { color } };

  switch (id.split('-')[0]) {
    case 'blog':
      return <Globe {...iconProps} />;
    case 'facebook':
      return <Facebook {...iconProps} />;
    case 'linkedin':
      return <Linkedin {...iconProps} />;
    case 'twitter':
      return <Twitter {...iconProps} />;
    case 'instagram':
      return <Instagram {...iconProps} />;
    case 'pinterest':
      return <Zap {...iconProps} />;
    default:
      return <Globe {...iconProps} />;
  }
};

const Dashboard = () => {
  const { data: channels, isLoading, error } = useChannels();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your channels...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load channels</p>
              <p className="text-muted-foreground text-sm">{error.message}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const channelsWithIcons = channels?.map(channel => ({
    ...channel,
    icon: getChannelIcon(channel.id, channel.color)
  })) || [];

  const totalFollowers = channelsWithIcons.reduce((acc, channel) => {
    const followers = parseFloat(channel.stats.followers.replace('K', '')) * 1000
    return acc + followers
  }, 0)

  const totalScheduled = channelsWithIcons.reduce((acc, channel) => acc + channel.stats.scheduledPosts, 0)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card shadow-material-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Reach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {(totalFollowers / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-material-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Scheduled Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalScheduled}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all channels</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-material-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Avg. Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">4.8%</div>
              <p className="text-xs text-success flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                +0.4% from last week
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-material-md border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Channels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {channelsWithIcons.filter(c => c.status === 'connected').length}
              </div>
              <div className="flex gap-1 mt-2">
                <Badge className="bg-success text-success-foreground text-xs">
                  {channelsWithIcons.filter(c => c.status === 'connected').length} Connected
                </Badge>
                {channelsWithIcons.filter(c => c.status === 'error').length > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs">
                    {channelsWithIcons.filter(c => c.status === 'error').length} Error
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channels Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Content Channels</h2>
            <Badge className="bg-accent text-accent-foreground">
              {channelsWithIcons.length} Platforms
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channelsWithIcons.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard