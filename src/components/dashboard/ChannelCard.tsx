import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Users, Calendar, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"

interface ChannelCardProps {
  channel: {
    id: string
    name: string
    platform: string
    icon: React.ReactNode
    color: string
    stats: {
      followers: string
      scheduledPosts: number
      engagement: string
    }
    status: 'connected' | 'disconnected' | 'error'
  }
}

export function ChannelCard({ channel }: ChannelCardProps) {
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
    <Card className="group relative overflow-hidden border-0 bg-card shadow-material-md hover:shadow-material-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg shadow-sm"
              style={{ backgroundColor: channel.color + '20' }}
            >
              {channel.icon}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{channel.name}</h3>
              <p className="text-sm text-muted-foreground">{channel.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getStatusColor(channel.status)}`}>
              {channel.status}
            </Badge>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" />
            </div>
            <p className="text-sm font-medium">{channel.stats.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
            </div>
            <p className="text-sm font-medium">{channel.stats.scheduledPosts}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
            </div>
            <p className="text-sm font-medium">{channel.stats.engagement}</p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>

        <Link to={`/channel/${channel.id}`} className="block">
          <Button className="w-full bg-primary hover:bg-primary-hover text-primary-foreground">
            Manage Channel
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}