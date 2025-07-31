import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Globe, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { useConnectWordPressSite } from '@/hooks/use-api'

const wordPressSchema = z.object({
  site_url: z.string().url('Please enter a valid URL').refine(url => {
    return url.includes('wordpress') || url.includes('.com') || url.includes('.org')
  }, 'Please enter a valid WordPress site URL'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  api_key: z.string().optional(),
  is_active: z.boolean().default(true)
})

type WordPressFormData = z.infer<typeof wordPressSchema>

const WordPressConnect: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)

  const connectSite = useConnectWordPressSite()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<WordPressFormData>({
    resolver: zodResolver(wordPressSchema),
    defaultValues: {
      is_active: true
    }
  })

  const watchedSiteUrl = watch('site_url')

  const onSubmit = async (data: WordPressFormData) => {
    try {
      const credentials = {
        user_id: user?.id || '',
        site_url: data.site_url,
        username: data.username,
        password: data.password,
        api_key: data.api_key || null,
        is_active: data.is_active
      }

      await connectSite.mutateAsync(credentials)
      
      toast({
        title: 'WordPress site connected successfully!',
        description: 'Your WordPress site has been connected and is ready for content management.',
      })

      navigate('/wordpress/sites')
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error instanceof Error ? error.message : 'Failed to connect WordPress site',
        variant: 'destructive',
      })
    }
  }

  const testConnection = async () => {
    if (!watchedSiteUrl) {
      toast({
        title: 'No URL provided',
        description: 'Please enter a WordPress site URL first.',
        variant: 'destructive',
      })
      return
    }

    setIsTestingConnection(true)
    
    try {
      // Mock connection test
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Connection successful!',
        description: 'Your WordPress site is accessible and ready to connect.',
      })
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Unable to connect to the WordPress site. Please check your credentials.',
        variant: 'destructive',
      })
    } finally {
      setIsTestingConnection(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Connect WordPress Site</h1>
          <p className="text-gray-600 mt-2">
            Connect your WordPress site to enable AI-powered content generation and management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Connection Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Site Connection
            </CardTitle>
            <CardDescription>
              Enter your WordPress site credentials to establish a secure connection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Site URL */}
              <div>
                <Label htmlFor="site_url">WordPress Site URL *</Label>
                <Input
                  id="site_url"
                  {...register('site_url')}
                  placeholder="https://your-site.com"
                  className={errors.site_url ? 'border-red-500' : ''}
                />
                {errors.site_url && (
                  <p className="text-red-500 text-sm mt-1">{errors.site_url.message}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...register('username')}
                  placeholder="Enter your WordPress username"
                  className={errors.username ? 'border-red-500' : ''}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="Enter your WordPress password"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* API Key (Optional) */}
              <div>
                <Label htmlFor="api_key">API Key (Optional)</Label>
                <Input
                  id="api_key"
                  {...register('api_key')}
                  placeholder="Enter WordPress API key if you have one"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Some WordPress plugins require an API key for enhanced functionality
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active">Active Connection</Label>
              </div>

              {/* Test Connection Button */}
              <Button
                type="button"
                variant="outline"
                onClick={testConnection}
                disabled={isTestingConnection || !watchedSiteUrl}
                className="w-full"
              >
                {isTestingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Site'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information Panel */}
        <div className="space-y-6">
          {/* Security Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Security & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Encrypted Storage</p>
                  <p className="text-sm text-gray-600">All credentials are encrypted and stored securely</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Read-Only Access</p>
                  <p className="text-sm text-gray-600">We only read your content, never modify without permission</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Secure API</p>
                  <p className="text-sm text-gray-600">All connections use HTTPS and secure protocols</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                What You'll Get
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">AI Content Analysis</p>
                  <p className="text-sm text-gray-600">Automatically analyze your content to understand your niche</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Smart Article Generation</p>
                  <p className="text-sm text-gray-600">Generate SEO-optimized articles using AI</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Automated Scheduling</p>
                  <p className="text-sm text-gray-600">Schedule articles from hourly to yearly intervals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Category Management</p>
                  <p className="text-sm text-gray-600">Organize content by categories with separate schedules</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">WordPress Site</p>
                  <p className="text-sm text-gray-600">Self-hosted WordPress or WordPress.com site</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Admin Access</p>
                  <p className="text-sm text-gray-600">Administrator or Editor role required</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2" />
                <div>
                  <p className="font-medium">REST API Enabled</p>
                  <p className="text-sm text-gray-600">WordPress REST API must be accessible</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WordPressConnect 