import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Calendar, Settings } from "lucide-react"

interface ChannelTabsProps {
  channelId: string
}

export function ChannelTabs({ channelId }: ChannelTabsProps) {
  return (
    <Tabs defaultValue="content" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-3 bg-surface-container">
        <TabsTrigger value="content" className="gap-2">
          <FileText className="h-4 w-4" />
          Content
        </TabsTrigger>
        <TabsTrigger value="schedule" className="gap-2">
          <Calendar className="h-4 w-4" />
          Schedule
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="content" className="mt-6">
        <div className="space-y-6">
          <div className="text-center py-12 bg-surface-container rounded-lg border-2 border-dashed border-border">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-4">Start creating content for this channel</p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors">
              Create First Post
            </button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="mt-6">
        <div className="space-y-6">
          <div className="text-center py-12 bg-surface-container rounded-lg border-2 border-dashed border-border">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-4">Schedule your content for optimal engagement</p>
            <button className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent-hover transition-colors">
              Schedule Content
            </button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="max-w-2xl space-y-6">
          <div className="bg-card rounded-lg shadow-material-md p-6">
            <h3 className="text-lg font-semibold mb-4">Channel Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Auto-posting Schedule</label>
                <p className="text-sm text-muted-foreground">Configure when content should be automatically posted</p>
              </div>
              <div>
                <label className="text-sm font-medium">AI Content Preferences</label>
                <p className="text-sm text-muted-foreground">Customize how AI transforms content for this platform</p>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}