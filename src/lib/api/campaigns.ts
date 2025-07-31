import { APIService, APIResponse } from './index'
import type { Tables, TablesInsert, TablesUpdate } from './index'

export type Campaign = Tables<'campaigns'>
export type CampaignInsert = TablesInsert<'campaigns'>
export type CampaignUpdate = TablesUpdate<'campaigns'>

export type CampaignTemplate = Tables<'campaign_templates'>
export type CampaignTemplateInsert = TablesInsert<'campaign_templates'>
export type CampaignTemplateUpdate = TablesUpdate<'campaign_templates'>

export type CampaignContent = Tables<'campaign_content'>
export type CampaignSchedule = Tables<'campaign_schedules'>

export interface CampaignWithDetails extends Campaign {
  template?: CampaignTemplate
  content_count?: number
  scheduled_count?: number
  published_count?: number
}

export interface CampaignStats {
  total_campaigns: number
  active_campaigns: number
  draft_campaigns: number
  completed_campaigns: number
  total_content_pieces: number
  total_scheduled_posts: number
}

export class CampaignService extends APIService {
  // Campaign CRUD operations
  async getCampaigns(userId: string): Promise<APIResponse<Campaign[]>> {
    return this.get<Campaign>('campaigns', { user_id: userId })
  }

  async getCampaignById(id: string): Promise<APIResponse<Campaign>> {
    return this.getById<Campaign>('campaigns', id)
  }

  async createCampaign(data: CampaignInsert): Promise<APIResponse<Campaign>> {
    return this.create<Campaign>('campaigns', data)
  }

  async updateCampaign(id: string, data: CampaignUpdate): Promise<APIResponse<Campaign>> {
    return this.update<Campaign>('campaigns', id, data)
  }

  async deleteCampaign(id: string): Promise<APIResponse<void>> {
    return this.delete('campaigns', id)
  }

  // Campaign with details
  async getCampaignWithDetails(id: string): Promise<APIResponse<CampaignWithDetails>> {
    const response = await supabase
      .from('campaigns')
      .select(`
        *,
        template:campaign_templates(*),
        content_count:campaign_content(count),
        scheduled_count:campaign_schedules(count),
        published_count:campaign_schedules(count)
      `)
      .eq('id', id)
      .single()

    return this.handleResponse(response)
  }

  // Campaign templates
  async getTemplates(isPublic?: boolean): Promise<APIResponse<CampaignTemplate[]>> {
    let query = supabase.from('campaign_templates').select('*')
    
    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic)
    }

    const response = await query
    return this.handleResponse(response)
  }

  async getTemplateById(id: string): Promise<APIResponse<CampaignTemplate>> {
    return this.getById<CampaignTemplate>('campaign_templates', id)
  }

  async createTemplate(data: CampaignTemplateInsert): Promise<APIResponse<CampaignTemplate>> {
    return this.create<CampaignTemplate>('campaign_templates', data)
  }

  async updateTemplate(id: string, data: CampaignTemplateUpdate): Promise<APIResponse<CampaignTemplate>> {
    return this.update<CampaignTemplate>('campaign_templates', id, data)
  }

  async deleteTemplate(id: string): Promise<APIResponse<void>> {
    return this.delete('campaign_templates', id)
  }

  // Campaign content management
  async addContentToCampaign(campaignId: string, contentPieceId: string, orderIndex?: number): Promise<APIResponse<CampaignContent>> {
    const data = {
      campaign_id: campaignId,
      content_piece_id: contentPieceId,
      order_index: orderIndex || 0
    }

    return this.create<CampaignContent>('campaign_content', data)
  }

  async removeContentFromCampaign(campaignId: string, contentPieceId: string): Promise<APIResponse<void>> {
    const response = await supabase
      .from('campaign_content')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('content_piece_id', contentPieceId)

    return this.handleResponse(response)
  }

  async getCampaignContent(campaignId: string): Promise<APIResponse<CampaignContent[]>> {
    return this.get<CampaignContent>('campaign_content', { campaign_id: campaignId })
  }

  // Campaign scheduling
  async scheduleCampaign(campaignId: string, channelId: string, scheduledAt: string): Promise<APIResponse<CampaignSchedule>> {
    const data = {
      campaign_id: campaignId,
      channel_id: channelId,
      scheduled_at: scheduledAt,
      status: 'pending'
    }

    return this.create<CampaignSchedule>('campaign_schedules', data)
  }

  async getCampaignSchedules(campaignId: string): Promise<APIResponse<CampaignSchedule[]>> {
    return this.get<CampaignSchedule>('campaign_schedules', { campaign_id: campaignId })
  }

  async updateScheduleStatus(scheduleId: string, status: CampaignSchedule['status']): Promise<APIResponse<CampaignSchedule>> {
    return this.update<CampaignSchedule>('campaign_schedules', scheduleId, { status })
  }

  // Campaign statistics
  async getCampaignStats(userId: string): Promise<APIResponse<CampaignStats>> {
    const [campaignsResponse, contentResponse, schedulesResponse] = await Promise.all([
      supabase.from('campaigns').select('status').eq('user_id', userId),
      supabase.from('campaign_content').select('campaign_id').eq('campaigns.user_id', userId),
      supabase.from('campaign_schedules').select('status').eq('campaigns.user_id', userId)
    ])

    if (campaignsResponse.error || contentResponse.error || schedulesResponse.error) {
      return {
        data: null,
        error: new APIError('Failed to fetch campaign statistics'),
        status: 500
      }
    }

    const campaigns = campaignsResponse.data || []
    const content = contentResponse.data || []
    const schedules = schedulesResponse.data || []

    const stats: CampaignStats = {
      total_campaigns: campaigns.length,
      active_campaigns: campaigns.filter(c => c.status === 'active').length,
      draft_campaigns: campaigns.filter(c => c.status === 'draft').length,
      completed_campaigns: campaigns.filter(c => c.status === 'completed').length,
      total_content_pieces: content.length,
      total_scheduled_posts: schedules.filter(s => s.status === 'pending').length
    }

    return {
      data: stats,
      error: null,
      status: 200
    }
  }

  // Bulk operations
  async bulkUpdateCampaignStatus(campaignIds: string[], status: Campaign['status']): Promise<APIResponse<Campaign[]>> {
    const response = await supabase
      .from('campaigns')
      .update({ status })
      .in('id', campaignIds)
      .select()

    return this.handleResponse(response)
  }

  async duplicateCampaign(campaignId: string, newName: string): Promise<APIResponse<Campaign>> {
    // Get the original campaign
    const campaignResponse = await this.getCampaignById(campaignId)
    if (campaignResponse.error || !campaignResponse.data) {
      return campaignResponse
    }

    const originalCampaign = campaignResponse.data

    // Create new campaign with modified data
    const newCampaignData: CampaignInsert = {
      ...originalCampaign,
      name: newName,
      status: 'draft',
      start_date: null,
      end_date: null
    }

    delete (newCampaignData as any).id
    delete (newCampaignData as any).created_at
    delete (newCampaignData as any).updated_at

    return this.createCampaign(newCampaignData)
  }
}

// Export singleton instance
export const campaignService = new CampaignService() 