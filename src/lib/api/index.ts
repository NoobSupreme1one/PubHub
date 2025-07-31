import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

// Re-export types for convenience
export type { Database } from '@/integrations/supabase/types'
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Base API error class
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Base API response wrapper
export interface APIResponse<T = any> {
  data: T | null
  error: APIError | null
  status: number
}

// Generic API service class
export class APIService {
  protected async handleResponse<T>(
    response: { data: T | null; error: any } | { data: T | null; error: any }
  ): Promise<APIResponse<T>> {
    if (response.error) {
      return {
        data: null,
        error: new APIError(
          response.error.message || 'An error occurred',
          response.error.status,
          response.error.code
        ),
        status: response.error.status || 500
      }
    }

    return {
      data: response.data,
      error: null,
      status: 200
    }
  }

  protected async get<T>(table: string, query?: any): Promise<APIResponse<T[]>> {
    let queryBuilder = supabase.from(table).select('*')
    
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryBuilder = queryBuilder.eq(key, value)
        }
      })
    }

    const response = await queryBuilder
    return this.handleResponse(response)
  }

  protected async getById<T>(table: string, id: string): Promise<APIResponse<T>> {
    const response = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single()

    return this.handleResponse(response)
  }

  protected async create<T>(table: string, data: any): Promise<APIResponse<T>> {
    const response = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    return this.handleResponse(response)
  }

  protected async update<T>(table: string, id: string, data: any): Promise<APIResponse<T>> {
    const response = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    return this.handleResponse(response)
  }

  protected async delete(table: string, id: string): Promise<APIResponse<void>> {
    const response = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    return this.handleResponse(response)
  }
}

// Export the supabase client for direct access when needed
export { supabase } 