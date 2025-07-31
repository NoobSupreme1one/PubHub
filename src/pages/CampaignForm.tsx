import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, Calendar, Target, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useCampaign, useUpdateCampaign, useCreateCampaign } from '@/hooks/use-api'
import { CampaignInsert, CampaignTemplate } from '@/lib/api/campaigns'

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100, 'Campaign name must be less than 100 characters'),
  description: z.string().optional(),
  template_id: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']).default('draft'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

// Mock templates - these would come from the API
const mockTemplates: CampaignTemplate[] = [
  {
    id: '1',
    name: 'B2B Product Launch',
    description: 'Perfect for launching new B2B products or services',
    template_type: 'b2b_launch',
    settings: {},
    is_public: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Consumer Product Campaign',
    description: 'Ideal for consumer-facing product promotions',
    template_type: 'consumer_product',
    settings: {},
    is_public: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Thought Leadership',
    description: 'Build authority and share industry insights',
    template_type: 'thought_leadership',
    settings: {},
    is_public: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const CampaignForm: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { toast } = useToast()
  const isEditing = !!id

  const { data: existingCampaign, isLoading: loadingCampaign } = useCampaign(id || '')
  const createCampaign = useCreateCampaign()
  const updateCampaign = useUpdateCampaign()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      status: 'draft',
    },
  })

  const watchedStatus = watch('status')

  // Load existing campaign data when editing
  useEffect(() => {
    if (isEditing && existingCampaign?.data) {
      const campaign = existingCampaign.data
      reset({
        name: campaign.name,
        description: campaign.description || '',
        template_id: campaign.template_id || '',
        status: campaign.status,
        start_date: campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '',
        end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
      })
    }
  }, [isEditing, existingCampaign, reset])

  const onSubmit = async (data: CampaignFormData) => {
    try {
      const campaignData: CampaignInsert = {
        user_id: user?.id || '',
        name: data.name,
        description: data.description || null,
        template_id: data.template_id || null,
        status: data.status,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
      }

      if (isEditing) {
        await updateCampaign.mutateAsync({ id: id!, data: campaignData })
        toast({
          title: 'Campaign updated',
          description: 'Your campaign has been successfully updated.',
        })
      } else {
        await createCampaign.mutateAsync(campaignData)
        toast({
          title: 'Campaign created',
          description: 'Your campaign has been successfully created.',
        })
      }

      navigate('/campaigns')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    }
  }

  if (isEditing && loadingCampaign) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
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
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/campaigns')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditing ? 'Update your campaign settings and content' : 'Set up your social media campaign'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Set the foundation for your campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter campaign name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe your campaign goals and strategy"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Campaign Template
            </CardTitle>
            <CardDescription>
              Choose a template to get started quickly or create from scratch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    watch('template_id') === template.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setValue('template_id', template.id)}
                >
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setValue('template_id', '')}
              >
                Start from scratch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Campaign Schedule
            </CardTitle>
            <CardDescription>
              Set when your campaign should start and end
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  {...register('start_date')}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/campaigns')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Campaign' : 'Create Campaign'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CampaignForm 