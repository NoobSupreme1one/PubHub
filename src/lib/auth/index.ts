import { supabase } from '@/integrations/supabase/client'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { errorHandler } from '@/lib/error-handling'

// Authentication state interface
export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

// User profile interface
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

// Sign up data interface
export interface SignUpData {
  email: string
  password: string
  full_name?: string
}

// Sign in data interface
export interface SignInData {
  email: string
  password: string
}

// Password reset data interface
export interface PasswordResetData {
  email: string
}

// Update profile data interface
export interface UpdateProfileData {
  full_name?: string
  avatar_url?: string
  timezone?: string
}

// Authentication service class
export class AuthService {
  // Get current session
  async getSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }
      return session
    } catch (error) {
      errorHandler.handleAuthError('Failed to get session')
      return null
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }
      return user
    } catch (error) {
      errorHandler.handleAuthError('Failed to get current user')
      return null
    }
  }

  // Sign up with email and password
  async signUp(data: SignUpData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      // Create user profile in our database
      if (authData.user) {
        await this.createUserProfile(authData.user)
      }

      return { user: authData.user, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed'
      return { user: null, error: errorMessage }
    }
  }

  // Sign in with email and password
  async signIn(data: SignInData): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: authData.user, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed'
      return { user: null, error: errorMessage }
    }
  }

  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'github' | 'facebook'): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth sign in failed'
      return { error: errorMessage }
    }
  }

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { error: error.message }
      }
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed'
      return { error: errorMessage }
    }
  }

  // Send password reset email
  async resetPassword(data: PasswordResetData): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed'
      return { error: errorMessage }
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed'
      return { error: errorMessage }
    }
  }

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }

      return data
    } catch (error) {
      errorHandler.handleAuthError('Failed to get user profile')
      return null
    }
  }

  // Create user profile
  async createUserProfile(user: User): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
        .select()
        .single()

      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }

      return data
    } catch (error) {
      errorHandler.handleAuthError('Failed to create user profile')
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, data: UpdateProfileData): Promise<UserProfile | null> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }

      return profile
    } catch (error) {
      errorHandler.handleAuthError('Failed to update user profile')
      return null
    }
  }

  // Update user avatar
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }

      return data
    } catch (error) {
      errorHandler.handleAuthError('Failed to update user avatar')
      return null
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        return { user: null, error: error.message }
      }

      if (user) {
        // Check if user profile exists, create if not
        const profile = await this.getUserProfile(user.id)
        if (!profile) {
          await this.createUserProfile(user)
        }
      }

      return { user, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth callback failed'
      return { user: null, error: errorMessage }
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession()
      return !!session
    } catch (error) {
      return false
    }
  }

  // Get user settings
  async getUserSettings(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        errorHandler.handleAuthError(error.message)
        return null
      }

      return data
    } catch (error) {
      errorHandler.handleAuthError('Failed to get user settings')
      return null
    }
  }

  // Update user settings
  async updateUserSettings(userId: string, settings: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: userId,
          ...settings
        })
        .select()
        .single()

      if (error) {
        errorHandler.handleAuthError(error.message)
        return null
      }

      return data
    } catch (error) {
      errorHandler.handleAuthError('Failed to update user settings')
      return null
    }
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export types
export type { User, Session, AuthError } from '@supabase/supabase-js' 