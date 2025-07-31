import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChannelTabs } from "@/components/channel/ChannelTabs"
import { ArrowLeft, Globe, Facebook, Linkedin, Twitter, Instagram, Zap } from "lucide-react"

const channelData = {
  blog: {
    name: 'Company Blog',
    platform: 'WordPress',
    icon: <Globe className="h-6 w-6" style={{ color: '#1976D2' }} />,
    color: '#1976D2',
    status: 'connected' as const
  },
  facebook: {
    name: 'Facebook Page',
    platform: 'Meta Business',
    icon: <Facebook className="h-6 w-6" style={{ color: '#1877F2' }} />,
    color: '#1877F2',
    status: 'connected' as const
  },
  linkedin: {
    name: 'LinkedIn Company',
    platform: 'LinkedIn Business',
    icon: <Linkedin className="h-6 w-6" style={{ color: '#0A66C2' }} />,
    color: '#0A66C2',
    status: 'connected' as const
  },
  twitter: {
    name: 'X (Twitter)',
    platform: 'X Corp',
    icon: <Twitter className="h-6 w-6" style={{ color: '#000000' }} />,
    color: '#000000',
    status: 'error' as const
  },
  instagram: {
    name: 'Instagram Business',
    platform: 'Meta Business',
    icon: <Instagram className="h-6 w-6" style={{ color: '#E4405F' }} />,
    color: '#E4405F',
    status: 'connected' as const
  },
  pinterest: {
    name: 'Pinterest Business',
    platform: 'Pinterest',
    icon: <Zap className="h-6 w-6" style={{ color: '#BD081C' }} />,
    color: '#BD081C',
    status: 'disconnected' as const
  }
}

const Channel = () => {
  const { channelId } = useParams<{ channelId: string }>()
  const channel = channelId ? channelData[channelId as keyof typeof channelData] : null

  if (!channel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Channel not found</h1>
          <Link to="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-success text-success-foreground'
      case 'error':
        return 'bg-destructive text-destructive-foreground'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-lg shadow-sm"
                style={{ backgroundColor: channel.color + '20' }}
              >
                {channel.icon}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{channel.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground">{channel.platform}</p>
                  <Badge className={`text-xs ${getStatusColor(channel.status)}`}>
                    {channel.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <ChannelTabs channelId={channelId!} />
      </main>
    </div>
  )
}

export default Channel