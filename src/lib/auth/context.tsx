import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { authService, AuthState, UserProfile } from './index'
import { errorHandler } from '@/lib/error-handling'

// Authentication context interface
interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook') => Promise<{ error: string | null }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  updateProfile: (data: { full_name?: string; avatar_url?: string; timezone?: string }) => Promise<{ error: string | null }>
  userProfile: UserProfile | null
  refreshUserProfile: () => Promise<void>
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Authentication provider props
interface AuthProviderProps {
  children: ReactNode
}

// Authentication provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  // Initialize authentication state
  useEffect(() => {
    initializeAuth()
    
    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        setAuthState(prev => ({
          ...prev,
          user: session?.user ?? null,
          session: session,
          loading: false
        }))

        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUserProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      const session = await authService.getSession()
      const user = session?.user ?? null

      setAuthState(prev => ({
        ...prev,
        user,
        session,
        loading: false
      }))

      if (user) {
        await loadUserProfile(user.id)
      }
    } catch (error) {
      errorHandler.handleAuthError('Failed to initialize authentication')
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize authentication'
      }))
    }
  }

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      const profile = await authService.getUserProfile(userId)
      setUserProfile(profile)
    } catch (error) {
      errorHandler.handleAuthError('Failed to load user profile')
    }
  }

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (authState.user) {
      await loadUserProfile(authState.user.id)
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { user, error } = await authService.signUp({ email, password, full_name: fullName })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      if (user) {
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          error: null
        }))
        
        await loadUserProfile(user.id)
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { user, error } = await authService.signIn({ email, password })
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      if (user) {
        setAuthState(prev => ({
          ...prev,
          user,
          loading: false,
          error: null
        }))
        
        await loadUserProfile(user.id)
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Sign in with OAuth
  const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await authService.signInWithOAuth(provider)
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth sign in failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await authService.signOut()
      
      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }))
        return { error }
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null
      })
      setUserProfile(null)

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await authService.resetPassword({ email })
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Update password function
  const updatePassword = async (newPassword: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const { error } = await authService.updatePassword(newPassword)
      
      setAuthState(prev => ({ ...prev, loading: false }))
      return { error }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Update profile function
  const updateProfile = async (data: { full_name?: string; avatar_url?: string; timezone?: string }) => {
    try {
      if (!authState.user) {
        return { error: 'No user logged in' }
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }))
      
      const profile = await authService.updateUserProfile(authState.user.id, data)
      
      if (profile) {
        setUserProfile(profile)
        setAuthState(prev => ({ ...prev, loading: false, error: null }))
        return { error: null }
      } else {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Failed to update profile' }))
        return { error: 'Failed to update profile' }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Profile update failed'
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { error: errorMessage }
    }
  }

  // Context value
  const contextValue: AuthContextType = {
    ...authState,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    userProfile,
    refreshUserProfile
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use authentication context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const { user, loading } = useAuth()
  return !loading && !!user
}

// Hook to get current user
export function useCurrentUser(): User | null {
  const { user } = useAuth()
  return user
}

// Hook to get user profile
export function useUserProfile(): UserProfile | null {
  const { userProfile } = useAuth()
  return userProfile
} 