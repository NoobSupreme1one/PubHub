import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, Globe, Plus, Trash2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useCampaign } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { formatDate, formatDateTime } from '@/utils/date'

interface ScheduleItem {
  id: string
  channelId: string
  channelName: string
  scheduledAt: string
  timezone: string
  status: 'pending' | 'published' | 'failed' | 'cancelled'
}

const CampaignSchedule: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [selectedTimezone, setSelectedTimezone] = useState('UTC')
  const [bulkDate, setBulkDate] = useState('')
  const [bulkTime, setBulkTime] = useState('')

  const { data: campaign, isLoading } = useCampaign(id || '')

  // Mock channels - these would come from the API
  const mockChannels = [
    { id: '1', name: 'Facebook Page', platform: 'Facebook' },
    { id: '2', name: 'LinkedIn Company', platform: 'LinkedIn' },
    { id: '3', name: 'Twitter Account', platform: 'Twitter' },
    { id: '4', name: 'Instagram Business', platform: 'Instagram' },
  ]

  const timezones = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ]

  const addSchedule = () => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      channelId: '',
      channelName: '',
      scheduledAt: '',
      timezone: selectedTimezone,
      status: 'pending',
    }
    setSchedules([...schedules, newSchedule])
  }

  const updateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, ...updates } : schedule
    ))
  }

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id))
  }

  const bulkSchedule = () => {
    if (!bulkDate || !bulkTime) return

    const baseDateTime = new Date(`${bulkDate}T${bulkTime}`)
    const newSchedules: ScheduleItem[] = mockChannels.map((channel, index) => ({
      id: Date.now().toString() + index,
      channelId: channel.id,
      channelName: channel.name,
      scheduledAt: new Date(baseDateTime.getTime() + index * 30 * 60000).toISOString(), // 30 min intervals
      timezone: selectedTimezone,
      status: 'pending',
    }))

    setSchedules([...schedules, ...newSchedules])
    setBulkDate('')
    setBulkTime('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'published': return '✅'
      case 'failed': return '❌'
      case 'cancelled': return '🚫'
      default: return '⏳'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!campaign?.data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Campaign not found</p>
              <Button onClick={() => navigate('/campaigns')} className="mt-4">
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
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/campaigns/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Schedule</h1>
          <p className="text-gray-600 mt-2">
            Schedule posts for "{campaign.data.name}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bulk Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Bulk Schedule
              </CardTitle>
              <CardDescription>
                Schedule posts across all channels at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bulk-date">Start Date</Label>
                  <Input
                    id="bulk-date"
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="bulk-time">Start Time</Label>
                  <Input
                    id="bulk-time"
                    type="time"
                    value={bulkTime}
                    onChange={(e) => setBulkTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={bulkSchedule} disabled={!bulkDate || !bulkTime}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule All Channels
              </Button>
            </CardContent>
          </Card>

          {/* Individual Schedules */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Scheduled Posts
                  </CardTitle>
                  <CardDescription>
                    Manage individual post schedules
                  </CardDescription>
                </div>
                <Button onClick={addSchedule}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {schedules.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No schedules yet</h3>
                  <p className="text-gray-600 mb-4">
                    Add individual schedules or use bulk scheduling above
                  </p>
                  <Button onClick={addSchedule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Schedule
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <Card key={schedule.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Select
                              value={schedule.channelId}
                              onValueChange={(value) => {
                                const channel = mockChannels.find(c => c.id === value)
                                updateSchedule(schedule.id, {
                                  channelId: value,
                                  channelName: channel?.name || ''
                                })
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Select channel" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockChannels.map((channel) => (
                                  <SelectItem key={channel.id} value={channel.id}>
                                    {channel.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Badge className={getStatusColor(schedule.status)}>
                              <span className="mr-1">{getStatusIcon(schedule.status)}</span>
                              {schedule.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <Input
                                type="datetime-local"
                                value={schedule.scheduledAt ? new Date(schedule.scheduledAt).toISOString().slice(0, 16) : ''}
                                onChange={(e) => updateSchedule(schedule.id, { scheduledAt: e.target.value })}
                                className="w-auto"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              <span>{schedule.timezone}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSchedule(schedule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Schedule Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Schedules</span>
                <span className="font-semibold">{schedules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending</span>
                <span className="font-semibold text-yellow-600">
                  {schedules.filter(s => s.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Published</span>
                <span className="font-semibold text-green-600">
                  {schedules.filter(s => s.status === 'published').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed</span>
                <span className="font-semibold text-red-600">
                  {schedules.filter(s => s.status === 'failed').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Save className="w-4 h-4 mr-2" />
                Save Schedule
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Clock className="w-4 h-4 mr-2" />
                Schedule History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CampaignSchedule 