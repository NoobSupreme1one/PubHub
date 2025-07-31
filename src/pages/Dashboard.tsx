import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { ChannelCard } from "@/components/dashboard/ChannelCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Target,
  FileText,
  Plus
} from "lucide-react"
import { useNavigate } from "react-router-dom"

const channels = [
  {
    id: 'blog',
    name: 'Company Blog',
    platform: 'WordPress',
    icon: <Globe className="h-5 w-5" style={{ color: '#1976D2' }} />,
    color: '#1976D2',
    stats: {
      followers: '2.4K',
      scheduledPosts: 5,
      engagement: '4.2%'
    },
    status: 'connected' as const
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    platform: 'Meta Business',
    icon: <Facebook className="h-5 w-5" style={{ color: '#1877F2' }} />,
    color: '#1877F2',
    stats: {
      followers: '12.5K',
      scheduledPosts: 8,
      engagement: '3.8%'
    },
    status: 'connected' as const
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Company',
    platform: 'LinkedIn Business',
    icon: <Linkedin className="h-5 w-5" style={{ color: '#0A66C2' }} />,
    color: '#0A66C2',
    stats: {
      followers: '8.9K',
      scheduledPosts: 3,
      engagement: '6.1%'
    },
    status: 'connected' as const
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    platform: 'X Corp',
    icon: <Twitter className="h-5 w-5" style={{ color: '#000000' }} />,
    color: '#000000',
    stats: {
      followers: '15.2K',
      scheduledPosts: 12,
      engagement: '2.9%'
    },
    status: 'error' as const
  },
  {
    id: 'instagram',
    name: 'Instagram Business',
    platform: 'Meta Business',
    icon: <Instagram className="h-5 w-5" style={{ color: '#E4405F' }} />,
    color: '#E4405F',
    stats: {
      followers: '6.7K',
      scheduledPosts: 6,
      engagement: '5.4%'
    },
    status: 'connected' as const
  },
  {
    id: 'pinterest',
    name: 'Pinterest Business',
    platform: 'Pinterest',
    icon: <Zap className="h-5 w-5" style={{ color: '#BD081C' }} />,
    color: '#BD081C',
    stats: {
      followers: '3.1K',
      scheduledPosts: 2,
      engagement: '7.2%'
    },
    status: 'disconnected' as const
  }
]

const Dashboard = () => {
  const navigate = useNavigate()
  
  const totalFollowers = channels.reduce((acc, channel) => {
    const followers = parseFloat(channel.stats.followers.replace('K', '')) * 1000
    return acc + followers
  }, 0)

  const totalScheduled = channels.reduce((acc, channel) => acc + channel.stats.scheduledPosts, 0)

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
                {channels.filter(c => c.status === 'connected').length}
              </div>
              <div className="flex gap-1 mt-2">
                <Badge className="bg-success text-success-foreground text-xs">
                  {channels.filter(c => c.status === 'connected').length} Connected
                </Badge>
                {channels.filter(c => c.status === 'error').length > 0 && (
                  <Badge className="bg-destructive text-destructive-foreground text-xs">
                    {channels.filter(c => c.status === 'error').length} Error
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaign Management */}
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Campaign Management</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/templates')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button
                onClick={() => navigate('/campaigns/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card shadow-material-md border-0 hover:shadow-material-lg transition-shadow cursor-pointer" onClick={() => navigate('/campaigns')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Active Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">0</div>
                <p className="text-xs text-muted-foreground mt-1">Manage your campaigns</p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-material-md border-0 hover:shadow-material-lg transition-shadow cursor-pointer" onClick={() => navigate('/templates')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">3</div>
                <p className="text-xs text-muted-foreground mt-1">Pre-built templates</p>
              </CardContent>
            </Card>

            <Card className="bg-card shadow-material-md border-0 hover:shadow-material-lg transition-shadow cursor-pointer" onClick={() => navigate('/campaigns/new')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">New</div>
                <p className="text-xs text-muted-foreground mt-1">Create campaign</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Channels Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground">Content Channels</h2>
            <Badge className="bg-accent text-accent-foreground">
              {channels.length} Platforms
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard