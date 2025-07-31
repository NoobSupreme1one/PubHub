import { APIService, APIResponse } from './index'
import type { Tables, TablesInsert, TablesUpdate } from './index'

export type ContentPiece = Tables<'content_pieces'>
export type ContentPieceInsert = TablesInsert<'content_pieces'>
export type ContentPieceUpdate = TablesUpdate<'content_pieces'>

export type ContentAdaptation = Tables<'content_adaptations'>
export type ContentAdaptationInsert = TablesInsert<'content_adaptations'>
export type ContentAdaptationUpdate = TablesUpdate<'content_adaptations'>

export type ContentAsset = Tables<'content_assets'>
export type ContentAssetInsert = TablesInsert<'content_assets'>

export interface ContentWithAdaptations extends ContentPiece {
  adaptations?: ContentAdaptation[]
  assets?: ContentAsset[]
}

export interface ContentAdaptationWithPlatform extends ContentAdaptation {
  platform?: Tables<'platforms'>
}

export interface ContentStats {
  total_content: number
  blog_posts: number
  articles: number
  social_posts: number
  custom_content: number
  total_adaptations: number
  total_assets: number
}

export class ContentService extends APIService {
  // Content pieces operations
  async getContentPieces(userId: string): Promise<APIResponse<ContentPiece[]>> {
    return this.get<ContentPiece>('content_pieces', { user_id: userId })
  }

  async getContentById(id: string): Promise<APIResponse<ContentPiece>> {
    return this.getById<ContentPiece>('content_pieces', id)
  }

  async createContent(data: ContentPieceInsert): Promise<APIResponse<ContentPiece>> {
    return this.create<ContentPiece>('content_pieces', data)
  }

  async updateContent(id: string, data: ContentPieceUpdate): Promise<APIResponse<ContentPiece>> {
    return this.update<ContentPiece>('content_pieces', id, data)
  }

  async deleteContent(id: string): Promise<APIResponse<void>> {
    return this.delete('content_pieces', id)
  }

  // Content with details
  async getContentWithDetails(id: string): Promise<APIResponse<ContentWithAdaptations>> {
    const response = await supabase
      .from('content_pieces')
      .select(`
        *,
        adaptations:content_adaptations(*),
        assets:content_assets(*)
      `)
      .eq('id', id)
      .single()

    return this.handleResponse(response)
  }

  async getUserContentWithDetails(userId: string): Promise<APIResponse<ContentWithAdaptations[]>> {
    const response = await supabase
      .from('content_pieces')
      .select(`
        *,
        adaptations:content_adaptations(*),
        assets:content_assets(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  // Content adaptations
  async getContentAdaptations(contentPieceId: string): Promise<APIResponse<ContentAdaptation[]>> {
    return this.get<ContentAdaptation>('content_adaptations', { content_piece_id: contentPieceId })
  }

  async getAdaptationById(id: string): Promise<APIResponse<ContentAdaptation>> {
    return this.getById<ContentAdaptation>('content_adaptations', id)
  }

  async createAdaptation(data: ContentAdaptationInsert): Promise<APIResponse<ContentAdaptation>> {
    return this.create<ContentAdaptation>('content_adaptations', data)
  }

  async updateAdaptation(id: string, data: ContentAdaptationUpdate): Promise<APIResponse<ContentAdaptation>> {
    return this.update<ContentAdaptation>('content_adaptations', id, data)
  }

  async deleteAdaptation(id: string): Promise<APIResponse<void>> {
    return this.delete('content_adaptations', id)
  }

  async getAdaptationByPlatform(contentPieceId: string, platformId: string): Promise<APIResponse<ContentAdaptation>> {
    const response = await supabase
      .from('content_adaptations')
      .select('*')
      .eq('content_piece_id', contentPieceId)
      .eq('platform_id', platformId)
      .single()

    return this.handleResponse(response)
  }

  async getAdaptationsWithPlatforms(contentPieceId: string): Promise<APIResponse<ContentAdaptationWithPlatform[]>> {
    const response = await supabase
      .from('content_adaptations')
      .select(`
        *,
        platform:platforms(*)
      `)
      .eq('content_piece_id', contentPieceId)

    return this.handleResponse(response)
  }

  // Content assets
  async getContentAssets(contentPieceId: string): Promise<APIResponse<ContentAsset[]>> {
    return this.get<ContentAsset>('content_assets', { content_piece_id: contentPieceId })
  }

  async getAssetById(id: string): Promise<APIResponse<ContentAsset>> {
    return this.getById<ContentAsset>('content_assets', id)
  }

  async createAsset(data: ContentAssetInsert): Promise<APIResponse<ContentAsset>> {
    return this.create<ContentAsset>('content_assets', data)
  }

  async updateAsset(id: string, data: Partial<ContentAssetInsert>): Promise<APIResponse<ContentAsset>> {
    return this.update<ContentAsset>('content_assets', id, data)
  }

  async deleteAsset(id: string): Promise<APIResponse<void>> {
    return this.delete('content_assets', id)
  }

  async getAssetsByType(contentPieceId: string, assetType: ContentAsset['asset_type']): Promise<APIResponse<ContentAsset[]>> {
    const response = await supabase
      .from('content_assets')
      .select('*')
      .eq('content_piece_id', contentPieceId)
      .eq('asset_type', assetType)

    return this.handleResponse(response)
  }

  // Content search and filtering
  async searchContent(userId: string, query: string): Promise<APIResponse<ContentPiece[]>> {
    const response = await supabase
      .from('content_pieces')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  async getContentByType(userId: string, contentType: ContentPiece['content_type']): Promise<APIResponse<ContentPiece[]>> {
    return this.get<ContentPiece>('content_pieces', { 
      user_id: userId,
      content_type: contentType
    })
  }

  // Content statistics
  async getContentStats(userId: string): Promise<APIResponse<ContentStats>> {
    const [contentResponse, adaptationsResponse, assetsResponse] = await Promise.all([
      supabase.from('content_pieces').select('content_type').eq('user_id', userId),
      supabase.from('content_adaptations').select('content_piece_id').eq('content_pieces.user_id', userId),
      supabase.from('content_assets').select('content_piece_id').eq('content_pieces.user_id', userId)
    ])

    if (contentResponse.error || adaptationsResponse.error || assetsResponse.error) {
      return {
        data: null,
        error: new APIError('Failed to fetch content statistics'),
        status: 500
      }
    }

    const content = contentResponse.data || []
    const adaptations = adaptationsResponse.data || []
    const assets = assetsResponse.data || []

    const stats: ContentStats = {
      total_content: content.length,
      blog_posts: content.filter(c => c.content_type === 'blog_post').length,
      articles: content.filter(c => c.content_type === 'article').length,
      social_posts: content.filter(c => c.content_type === 'social_post').length,
      custom_content: content.filter(c => c.content_type === 'custom').length,
      total_adaptations: adaptations.length,
      total_assets: assets.length
    }

    return {
      data: stats,
      error: null,
      status: 200
    }
  }

  // Content adaptation helpers
  async generateAdaptations(contentPieceId: string, platformIds: string[]): Promise<APIResponse<ContentAdaptation[]>> {
    const contentResponse = await this.getContentById(contentPieceId)
    if (contentResponse.error || !contentResponse.data) {
      return contentResponse
    }

    const content = contentResponse.data
    const adaptations: ContentAdaptationInsert[] = []

    for (const platformId of platformIds) {
      // This would integrate with the content adaptation engine
      // For now, we'll create basic adaptations
      const adaptedContent = this.adaptContentForPlatform(content, platformId)
      
      adaptations.push({
        content_piece_id: contentPieceId,
        platform_id: platformId,
        adapted_content: adaptedContent,
        character_count: adaptedContent.length,
        hashtags: [],
        mentions: [],
        media_urls: [],
        adaptation_rules: {},
        is_auto_generated: true
      })
    }

    const results: ContentAdaptation[] = []
    for (const adaptation of adaptations) {
      const result = await this.createAdaptation(adaptation)
      if (result.data) {
        results.push(result.data)
      }
    }

    return {
      data: results,
      error: null,
      status: 200
    }
  }

  private adaptContentForPlatform(content: ContentPiece, platformId: string): string {
    // This is a placeholder for the content adaptation engine
    // In the real implementation, this would use AI/ML to adapt content
    const baseContent = content.content
    
    // Simple character limit adaptation (this would be much more sophisticated)
    const platformLimits: Record<string, number> = {
      'twitter': 280,
      'facebook': 63206,
      'linkedin': 3000,
      'instagram': 2200,
      'pinterest': 500
    }

    const limit = platformLimits[platformId] || 1000
    return baseContent.length > limit ? baseContent.substring(0, limit - 3) + '...' : baseContent
  }

  // Bulk operations
  async bulkDeleteContent(contentIds: string[]): Promise<APIResponse<void>> {
    const response = await supabase
      .from('content_pieces')
      .delete()
      .in('id', contentIds)

    return this.handleResponse(response)
  }

  async duplicateContent(contentId: string, newTitle: string): Promise<APIResponse<ContentPiece>> {
    const contentResponse = await this.getContentById(contentId)
    if (contentResponse.error || !contentResponse.data) {
      return contentResponse
    }

    const originalContent = contentResponse.data
    const newContentData: ContentPieceInsert = {
      ...originalContent,
      title: newTitle
    }

    delete (newContentData as any).id
    delete (newContentData as any).created_at
    delete (newContentData as any).updated_at

    return this.createContent(newContentData)
  }

  // Content validation
  async validateContent(content: ContentPieceInsert): Promise<APIResponse<{ isValid: boolean; errors: string[] }>> {
    const errors: string[] = []

    if (!content.title || content.title.trim().length === 0) {
      errors.push('Title is required')
    }

    if (!content.content || content.content.trim().length === 0) {
      errors.push('Content is required')
    }

    if (content.title && content.title.length > 255) {
      errors.push('Title must be less than 255 characters')
    }

    return {
      data: {
        isValid: errors.length === 0,
        errors
      },
      error: null,
      status: 200
    }
  }
}

// Export singleton instance
export const contentService = new ContentService() 