import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Target, FileText, Settings, Copy, Edit, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/use-api'
import { useAuth } from '@/hooks/use-auth'
import { CampaignTemplate } from '@/lib/api/templates'

const Templates: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')

  const { data: templates, isLoading, error } = useTemplates()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'b2b_launch': return 'bg-blue-100 text-blue-800'
      case 'consumer_product': return 'bg-pink-100 text-pink-800'
      case 'thought_leadership': return 'bg-green-100 text-green-800'
      case 'custom': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'b2b_launch': return '🏢'
      case 'consumer_product': return '🛍️'
      case 'thought_leadership': return '💡'
      case 'custom': return '⚙️'
      default: return '📝'
    }
  }

  const filteredTemplates = templates?.data?.filter((template: CampaignTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab = activeTab === 'all' || template.template_type === activeTab
    return matchesSearch && matchesTab
  }) || []

  const handleDuplicateTemplate = async (template: CampaignTemplate) => {
    try {
      await createTemplate.mutateAsync({
        name: `${template.name} (Copy)`,
        description: template.description,
        template_type: template.template_type,
        settings: template.settings,
        is_public: false,
        created_by: user?.id
      })
    } catch (error) {
      console.error('Failed to duplicate template:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate.mutateAsync(templateId)
      } catch (error) {
        console.error('Failed to delete template:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600">Error loading templates: {error.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Templates</h1>
          <p className="text-gray-600 mt-2">Create and manage campaign templates</p>
        </div>
        <Button 
          onClick={() => navigate('/templates/new')}
          className="mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Template Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="b2b_launch">B2B Launch</TabsTrigger>
          <TabsTrigger value="consumer_product">Consumer Product</TabsTrigger>
          <TabsTrigger value="thought_leadership">Thought Leadership</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || activeTab !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by creating your first template'
                    }
                  </p>
                  {!searchTerm && activeTab === 'all' && (
                    <Button onClick={() => navigate('/templates/new')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template: CampaignTemplate) => (
                <Card 
                  key={template.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/templates/${template.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          {template.is_public && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <Badge className={getTemplateTypeColor(template.template_type)}>
                          <span className="mr-1">{getTemplateTypeIcon(template.template_type)}</span>
                          {template.template_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateTemplate(template)
                          }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        {!template.is_public && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/templates/${template.id}/edit`)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTemplate(template.id)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {template.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    {/* Template Settings Preview */}
                    {template.settings && (
                      <div className="space-y-2">
                        {template.settings.contentStructure && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Target className="w-3 h-3" />
                            <span>
                              {template.settings.contentStructure.mainPoints || 0} main points
                            </span>
                          </div>
                        )}
                        {template.settings.postingSchedule && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Settings className="w-3 h-3" />
                            <span>
                              {template.settings.postingSchedule.frequency || 'Custom'} posting
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common template operations
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/templates/new')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Template
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/campaigns/new')}
            >
              <Target className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate('/templates/import')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Import Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Templates 