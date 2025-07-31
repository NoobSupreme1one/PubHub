import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, FileText, Brain, Search, Sparkles, Download, Copy, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useWordPressSites, useNicheProfiles, useAIGenerateArticle, useAIGenerateTopics, useAIResearch } from '@/hooks/use-api'
import { GeneratedArticle } from '@/lib/api/wordpress'

const generateSchema = z.object({
  niche_profile_id: z.string().min(1, 'Please select a niche profile'),
  topic: z.string().optional(),
  target_word_count: z.number().min(100).max(5000).default(1000),
  seo_keywords: z.string().optional(),
  tone: z.enum(['professional', 'casual', 'friendly', 'authoritative', 'conversational']).default('professional'),
  include_research: z.boolean().default(true),
  research_query: z.string().optional(),
  include_featured_image: z.boolean().default(true)
})

type GenerateFormData = z.infer<typeof generateSchema>

const WordPressGenerate: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('generate')
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [showFullContent, setShowFullContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string>('')

  const { data: sites } = useWordPressSites(user?.id || '')
  const { data: nicheProfiles } = useNicheProfiles(user?.id || '')
  const generateArticle = useAIGenerateArticle()
  const generateTopics = useAIGenerateTopics()
  const researchTopic = useAIResearch()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      target_word_count: 1000,
      tone: 'professional',
      include_research: true,
      include_featured_image: true
    }
  })

  const watchedNicheProfileId = watch('niche_profile_id')
  const watchedIncludeResearch = watch('include_research')

  const selectedNicheProfile = nicheProfiles?.data?.find(p => p.id === watchedNicheProfileId)

  const onSubmit = async (data: GenerateFormData) => {
    try {
      if (!selectedNicheProfile) {
        toast({
          title: 'Niche profile not found',
          description: 'Please select a valid niche profile',
          variant: 'destructive',
        })
        return
      }

      const request = {
        niche_profile_id: data.niche_profile_id,
        topic: data.topic || selectedTopic,
        target_word_count: data.target_word_count,
        seo_keywords: data.seo_keywords ? data.seo_keywords.split(',').map(k => k.trim()) : undefined,
        tone: data.tone,
        include_research: data.include_research,
        research_query: data.research_query,
        include_featured_image: data.include_featured_image
      }

      const result = await generateArticle.mutateAsync(request)
      
      if (result.data) {
        setGeneratedArticle(result.data)
        setActiveTab('preview')
        toast({
          title: 'Article generated successfully!',
          description: 'Your AI-generated article is ready for review.',
        })
      }
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate article',
        variant: 'destructive',
      })
    }
  }

  const handleGenerateTopics = async () => {
    if (!selectedNicheProfile) {
      toast({
        title: 'No niche profile selected',
        description: 'Please select a niche profile first',
        variant: 'destructive',
      })
      return
    }

    try {
      const request = {
        niche_profile: {
          niche_name: selectedNicheProfile.niche_name,
          content_themes: selectedNicheProfile.content_themes,
          target_audience: selectedNicheProfile.target_audience
        },
        count: 5
      }

      const result = await generateTopics.mutateAsync(request)
      
      if (result.data) {
        toast({
          title: 'Topics generated!',
          description: `Generated ${result.data.topics.length} topic suggestions`,
        })
      }
    } catch (error) {
      toast({
        title: 'Topic generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate topics',
        variant: 'destructive',
      })
    }
  }

  const handleResearch = async (query: string) => {
    try {
      const result = await researchTopic.mutateAsync(query)
      
      if (result.data) {
        toast({
          title: 'Research completed!',
          description: `Found ${result.data.sources.length} sources for your query`,
        })
      }
    } catch (error) {
      toast({
        title: 'Research failed',
        description: error instanceof Error ? error.message : 'Failed to research topic',
        variant: 'destructive',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard',
      description: 'Article content has been copied to your clipboard',
    })
  }

  const downloadArticle = () => {
    if (!generatedArticle) return

    const content = `
# ${generatedArticle.title}

${generatedArticle.excerpt}

## Content

${generatedArticle.content}

## SEO Meta
- Title: ${generatedArticle.seo_meta.title}
- Description: ${generatedArticle.seo_meta.description}
- Keywords: ${generatedArticle.seo_meta.keywords.join(', ')}

## Article Details
- Word Count: ${generatedArticle.word_count}
- Reading Time: ${generatedArticle.reading_time} minutes
- Generated: ${generatedArticle.generated_at}
    `

    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${generatedArticle.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Article downloaded',
      description: 'Article has been downloaded as a Markdown file',
    })
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/wordpress')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to WordPress
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generate Article</h1>
          <p className="text-gray-600 mt-2">
            Create AI-powered articles using Google Gemini and Perplexity research
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="topics">Topic Ideas</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="preview" disabled={!generatedArticle}>Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generation Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Article Generation
                </CardTitle>
                <CardDescription>
                  Configure your article generation settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Niche Profile Selection */}
                  <div>
                    <Label htmlFor="niche_profile_id">Niche Profile *</Label>
                    <Select
                      value={watchedNicheProfileId}
                      onValueChange={(value) => setValue('niche_profile_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a niche profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {nicheProfiles?.data?.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.niche_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.niche_profile_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.niche_profile_id.message}</p>
                    )}
                  </div>

                  {/* Topic */}
                  <div>
                    <Label htmlFor="topic">Topic (Optional)</Label>
                    <Input
                      id="topic"
                      {...register('topic')}
                      placeholder="Enter a specific topic or leave blank for AI suggestion"
                    />
                    {errors.topic && (
                      <p className="text-red-500 text-sm mt-1">{errors.topic.message}</p>
                    )}
                  </div>

                  {/* Word Count */}
                  <div>
                    <Label htmlFor="target_word_count">Target Word Count</Label>
                    <Input
                      id="target_word_count"
                      type="number"
                      {...register('target_word_count', { valueAsNumber: true })}
                      min="100"
                      max="5000"
                      step="100"
                    />
                    {errors.target_word_count && (
                      <p className="text-red-500 text-sm mt-1">{errors.target_word_count.message}</p>
                    )}
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <Label htmlFor="seo_keywords">SEO Keywords (Optional)</Label>
                    <Input
                      id="seo_keywords"
                      {...register('seo_keywords')}
                      placeholder="keyword1, keyword2, keyword3"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      Separate keywords with commas
                    </p>
                  </div>

                  {/* Tone */}
                  <div>
                    <Label htmlFor="tone">Writing Tone</Label>
                    <Select
                      value={watch('tone')}
                      onValueChange={(value) => setValue('tone', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="authoritative">Authoritative</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Research Options */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="include_research"
                        checked={watchedIncludeResearch}
                        onCheckedChange={(checked) => setValue('include_research', checked)}
                      />
                      <Label htmlFor="include_research">Include Research</Label>
                    </div>
                    
                    {watchedIncludeResearch && (
                      <div>
                        <Label htmlFor="research_query">Research Query</Label>
                        <Textarea
                          id="research_query"
                          {...register('research_query')}
                          placeholder="Enter a research query to enhance the article"
                          rows={3}
                        />
                      </div>
                    )}
                  </div>

                  {/* Featured Image */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="include_featured_image"
                      checked={watch('include_featured_image')}
                      onCheckedChange={(checked) => setValue('include_featured_image', checked)}
                    />
                    <Label htmlFor="include_featured_image">Generate Featured Image</Label>
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting || generateArticle.isPending}
                    className="w-full"
                  >
                    {isSubmitting || generateArticle.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Article...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Article
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Niche Profile Info */}
            {selectedNicheProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Niche Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedNicheProfile.niche_name}</h3>
                    <p className="text-gray-600">{selectedNicheProfile.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Target Audience</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNicheProfile.target_audience.map((audience, index) => (
                        <Badge key={index} variant="outline">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Content Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNicheProfile.content_themes.map((theme, index) => (
                        <Badge key={index} variant="secondary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tone of Voice</h4>
                    <p className="text-gray-600">{selectedNicheProfile.tone_of_voice}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">SEO Focus</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedNicheProfile.seo_focus.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Topic Ideas
              </CardTitle>
              <CardDescription>
                Generate topic suggestions based on your niche profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedNicheProfile ? (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Please select a niche profile to generate topic ideas</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleGenerateTopics}
                    disabled={generateTopics.isPending}
                    className="w-full"
                  >
                    {generateTopics.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Topics...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Topic Ideas
                      </>
                    )}
                  </Button>
                  
                  {generateTopics.data?.data?.topics && (
                    <div className="space-y-3">
                      {generateTopics.data.data.topics.map((topic, index) => (
                        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold mb-2">{topic.title}</h4>
                                <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>Difficulty: {topic.difficulty}</span>
                                  <span>~{topic.estimated_word_count} words</span>
                                  <span>SEO: {topic.seo_potential}</span>
                                  <span>Trending: {Math.round(topic.trending_score * 100)}%</span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTopic(topic.title)
                                  setValue('topic', topic.title)
                                  setActiveTab('generate')
                                }}
                              >
                                Use Topic
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="research" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Research Tool
              </CardTitle>
              <CardDescription>
                Research topics using Perplexity AI to enhance your articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="research_query_input">Research Query</Label>
                  <div className="flex gap-2">
                    <Input
                      id="research_query_input"
                      placeholder="Enter a research query..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          handleResearch(target.value)
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        const input = document.getElementById('research_query_input') as HTMLInputElement
                        handleResearch(input.value)
                      }}
                      disabled={researchTopic.isPending}
                    >
                      {researchTopic.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {researchTopic.data?.data && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Research Summary</h4>
                      <p className="text-gray-600">{researchTopic.data.data.summary}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {researchTopic.data.data.key_points.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Sources</h4>
                      <div className="space-y-2">
                        {researchTopic.data.data.sources.map((source, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div>
                              <p className="font-medium">{source.title}</p>
                              <p className="text-sm text-gray-500">{source.url}</p>
                            </div>
                            <Badge variant="outline">
                              {Math.round(source.relevance_score * 100)}% relevant
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedArticle && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Generated Article
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedArticle.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadArticle}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Article Header */}
                <div className="border-b pb-4">
                  <h1 className="text-2xl font-bold mb-2">{generatedArticle.title}</h1>
                  <p className="text-gray-600 mb-4">{generatedArticle.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{generatedArticle.word_count} words</span>
                    <span>{generatedArticle.reading_time} min read</span>
                    <span>Generated {new Date(generatedArticle.generated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* SEO Meta */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">SEO Meta</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {generatedArticle.seo_meta.title}
                    </div>
                    <div>
                      <span className="font-medium">Description:</span> {generatedArticle.seo_meta.description}
                    </div>
                    <div>
                      <span className="font-medium">Keywords:</span> {generatedArticle.seo_meta.keywords.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Content</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullContent(!showFullContent)}
                    >
                      {showFullContent ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Show Full
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className={`prose max-w-none ${!showFullContent ? 'max-h-96 overflow-hidden' : ''}`}>
                    <div className="whitespace-pre-wrap">{generatedArticle.content}</div>
                  </div>
                  
                  {!showFullContent && (
                    <div className="mt-4 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setShowFullContent(true)}
                      >
                        Show Full Content
                      </Button>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {generatedArticle.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WordPressGenerate 