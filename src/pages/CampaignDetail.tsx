import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Calendar, Target, FileText, BarChart3, Clock, CheckCircle, XCircle, Play, Pause, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCampaign, useCampaignWithDetails, useUpdateCampaign } from '@/hooks/use-api'
import { Campaign, CampaignWithDetails } from '@/lib/api/campaigns'
import { formatDate } from '@/utils/date'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const { data: campaignResponse, isLoading, error } = useCampaignWithDetails(id || '')
  const { data: campaignData } = useCampaign(id || '')
  const updateCampaign = useUpdateCampaign()

  const campaign = campaignResponse?.data || campaignData?.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'archived': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝'
      case 'scheduled': return '📅'
      case 'active': return '🚀'
      case 'paused': return '⏸️'
      case 'completed': return '✅'
      case 'archived': return '📁'
      default: return '📝'
    }
  }

  const handleStatusChange = async (newStatus: Campaign['status']) => {
    if (!campaign) return

    try {
      await updateCampaign.mutateAsync({
        id: campaign.id,
        data: { status: newStatus }
      })
    } catch (error) {
      console.error('Failed to update campaign status:', error)
    }
  }

  const getStatusActions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'draft':
        return [
          { label: 'Activate', status: 'active', icon: Play, variant: 'default' as const },
          { label: 'Schedule', status: 'scheduled', icon: Calendar, variant: 'outline' as const },
        ]
      case 'scheduled':
        return [
          { label: 'Activate Now', status: 'active', icon: Play, variant: 'default' as const },
          { label: 'Pause', status: 'paused', icon: Pause, variant: 'outline' as const },
        ]
      case 'active':
        return [
          { label: 'Pause', status: 'paused', icon: Pause, variant: 'outline' as const },
          { label: 'Complete', status: 'completed', icon: CheckCircle, variant: 'outline' as const },
        ]
      case 'paused':
        return [
          { label: 'Resume', status: 'active', icon: Play, variant: 'default' as const },
          { label: 'Complete', status: 'completed', icon: CheckCircle, variant: 'outline' as const },
        ]
      default:
        return [
          { label: 'Archive', status: 'archived', icon: Archive, variant: 'outline' as const },
        ]
    }
  }

  if (isLoading) {
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

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Campaign not found</h3>
              <p className="text-gray-600 mb-4">
                The campaign you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => navigate('/campaigns')}>
                Back to Campaigns
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/campaigns')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <Badge className={getStatusColor(campaign.status)}>
                <span className="mr-1">{getStatusIcon(campaign.status)}</span>
                {campaign.status}
              </Badge>
            </div>
            {campaign.description && (
              <p className="text-gray-600">{campaign.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {getStatusActions(campaign.status).map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() => handleStatusChange(action.status as Campaign['status'])}
            >
              <action.icon className="w-4 h-4 mr-2" />
              {action.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/campaigns/${campaign.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Content Pieces</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.content_count || 0}
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
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.scheduled_count || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {campaign.published_count || 0}
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
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campaign Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <p className="text-gray-900">{formatDate(campaign.created_at)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <p className="text-gray-900">{formatDate(campaign.updated_at)}</p>
                </div>
                {campaign.start_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Start Date</Label>
                    <p className="text-gray-900">{formatDate(campaign.start_date)}</p>
                  </div>
                )}
                {campaign.end_date && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">End Date</Label>
                    <p className="text-gray-900">{formatDate(campaign.end_date)}</p>
                  </div>
                )}
                {campaign.template && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Template</Label>
                    <p className="text-gray-900">{campaign.template.name}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/campaigns/${campaign.id}/content`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/campaigns/${campaign.id}/schedule`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Posts
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate(`/campaigns/${campaign.id}/analytics`)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Content</CardTitle>
              <CardDescription>
                Content pieces associated with this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
                <p className="text-gray-600 mb-4">
                  Add content pieces to your campaign to get started
                </p>
                <Button onClick={() => navigate(`/campaigns/${campaign.id}/content`)}>
                  Add Content
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>
                Scheduled posts and publishing timeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scheduled posts</h3>
                <p className="text-gray-600 mb-4">
                  Schedule your campaign posts to go live at optimal times
                </p>
                <Button onClick={() => navigate(`/campaigns/${campaign.id}/schedule`)}>
                  Schedule Posts
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Analytics</CardTitle>
              <CardDescription>
                Performance metrics and engagement data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data yet</h3>
                <p className="text-gray-600 mb-4">
                  Analytics will appear here once your campaign starts generating engagement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CampaignDetail 