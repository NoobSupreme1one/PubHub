import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { useToast } from '@/hooks/use-toast'

export default function OAuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  
  const { handleOAuthCallback } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      setStatus('loading')
      
      const { user, error } = await handleOAuthCallback()
      
      if (error) {
        setError(error)
        setStatus('error')
        toast({
          title: 'Authentication failed',
          description: error,
          variant: 'destructive'
        })
      } else if (user) {
        setStatus('success')
        toast({
          title: 'Success',
          description: 'Signed in successfully',
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      }
    } catch (error) {
      setError('An unexpected error occurred')
      setStatus('error')
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      })
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Icons.spinner className="h-8 w-8 animate-spin text-blue-600" />,
          title: 'Completing sign in...',
          description: 'Please wait while we complete your authentication.',
          color: 'text-blue-600'
        }
      case 'success':
        return {
          icon: <Icons.check className="h-8 w-8 text-green-600" />,
          title: 'Sign in successful!',
          description: 'Redirecting you to the dashboard...',
          color: 'text-green-600'
        }
      case 'error':
        return {
          icon: <Icons.alertCircle className="h-8 w-8 text-red-600" />,
          title: 'Sign in failed',
          description: error || 'An error occurred during authentication.',
          color: 'text-red-600'
        }
    }
  }

  const content = getStatusContent()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center">
              {content.icon}
            </div>
            <CardTitle className="text-2xl text-center">{content.title}</CardTitle>
            <CardDescription className="text-center">
              {content.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'error' && (
              <div className="text-center space-y-4">
                <Button
                  onClick={() => navigate('/auth/sign-in')}
                  className="w-full"
                >
                  Back to sign in
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 