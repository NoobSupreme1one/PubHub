import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Globe, Brain, FileText, Calendar, Settings, RefreshCw, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWordPressSites, useNicheProfiles, useArticleSchedules, useSyncWordPressSite } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { WordPressSite, NicheProfile, ArticleSchedule } from '@/lib/api/wordpress'
import { formatDate } from '@/utils/date'

const WordPress: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('sites')

  const { data: sites, isLoading: sitesLoading, error: sitesError } = useWordPressSites(user?.id || '')
  const { data: nicheProfiles, isLoading: profilesLoading } = useNicheProfiles(user?.id || '')
  const { data: schedules, isLoading: schedulesLoading } = useArticleSchedules(user?.id || '')
  const syncSite = useSyncWordPressSite()

  const handleSyncSite = async (siteId: string) => {
    try {
      await syncSite.mutateAsync(siteId)
    } catch (error) {
      console.error('Failed to sync site:', error)
    }
  }

  const getSiteStatusColor = (lastSync: string) => {
    const lastSyncDate = new Date(lastSync)
    const now = new Date()
    const daysSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceSync < 1) return 'bg-green-100 text-green-800'
    if (daysSinceSync < 7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getSiteStatusText = (lastSync: string) => {
    const lastSyncDate = new Date(lastSync)
    const now = new Date()
    const daysSinceSync = (now.getTime() - lastSyncDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceSync < 1) return 'Recently Synced'
    if (daysSinceSync < 7) return 'Needs Sync'
    return 'Outdated'
  }

  if (sitesLoading || profilesLoading || schedulesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WordPress Management</h1>
          <p className="text-gray-600 mt-2">AI-powered content generation and management for your WordPress sites</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => navigate('/wordpress/connect')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Site
          </Button>
          <Button
            onClick={() => navigate('/wordpress/generate')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Article
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Connected Sites</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sites?.data?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Niche Profiles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {nicheProfiles?.data?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Schedules</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schedules?.data?.filter(s => s.is_active).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {sites?.data?.reduce((acc, site) => acc + site.total_posts, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="sites">Connected Sites</TabsTrigger>
          <TabsTrigger value="niches">Niche Profiles</TabsTrigger>
          <TabsTrigger value="schedules">Article Schedules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="sites" className="space-y-6">
          {sitesError ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600">Error loading WordPress sites: {sitesError.message}</p>
                  <Button onClick={() => window.location.reload()} className="mt-4">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : sites?.data?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No WordPress sites connected</h3>
                  <p className="text-gray-600 mb-4">
                    Connect your first WordPress site to start generating AI-powered content
                  </p>
                  <Button onClick={() => navigate('/wordpress/connect')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Connect Your First Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sites?.data?.map((site: WordPressSite) => (
                <Card key={site.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{site.site_name}</h3>
                          <Badge className={getSiteStatusColor(site.last_sync)}>
                            {getSiteStatusText(site.last_sync)}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{site.site_url}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <span>{site.total_posts} posts</span>
                          <span>{site.total_pages} pages</span>
                          <span>{site.categories.length} categories</span>
                          <span>{site.tags.length} tags</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                          Last synced: {formatDate(site.last_sync)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSyncSite(site.id)}
                          disabled={syncSite.isPending}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/wordpress/sites/${site.id}`)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="niches" className="space-y-6">
          {nicheProfiles?.data?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No niche profiles yet</h3>
                  <p className="text-gray-600 mb-4">
                    Analyze your WordPress content to create niche profiles for better AI content generation
                  </p>
                  <Button onClick={() => navigate('/wordpress/analyze')}>
                    <Brain className="w-4 h-4 mr-2" />
                    Analyze Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {nicheProfiles?.data?.map((profile: NicheProfile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{profile.niche_name}</h3>
                          <Badge className="bg-purple-100 text-purple-800">
                            {profile.content_frequency}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{profile.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile.target_audience.slice(0, 3).map((audience, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {audience}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400">
                          Created: {formatDate(profile.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/wordpress/niches/${profile.id}`)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          {schedules?.data?.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No article schedules</h3>
                  <p className="text-gray-600 mb-4">
                    Set up automated article publishing schedules for your WordPress sites
                  </p>
                  <Button onClick={() => navigate('/wordpress/schedules/new')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {schedules?.data?.map((schedule: ArticleSchedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {schedule.frequency} Publishing
                          </h3>
                          <Badge className={schedule.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                            {schedule.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">
                          Next publish: {formatDate(schedule.next_publish_date)}
                        </p>
                        <div className="text-xs text-gray-400">
                          Created: {formatDate(schedule.created_at)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/wordpress/schedules/${schedule.id}`)}
                        >
                          <Settings className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  Detailed analytics and performance metrics for your WordPress content will be available soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WordPress 