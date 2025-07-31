import { APIService, APIResponse, supabase, APIError } from './index'
import type { Tables, TablesInsert, TablesUpdate } from './index'

export type PublishingQueue = Tables<'publishing_queue'>
export type PublishingQueueInsert = TablesInsert<'publishing_queue'>
export type PublishingQueueUpdate = TablesUpdate<'publishing_queue'>

export type PublishingHistory = Tables<'publishing_history'>
export type PublishingError = Tables<'publishing_errors'>

export interface PublishingStats {
  total_queued: number
  total_processing: number
  total_published: number
  total_failed: number
  success_rate: number
}

export class PublishingService extends APIService {
  // Publishing queue operations
  async getPublishingQueue(userId: string): Promise<APIResponse<PublishingQueue[]>> {
    const response = await supabase
      .from('publishing_queue')
      .select(`
        *,
        channel:user_channels!inner(user_id)
      `)
      .eq('channel.user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  async getQueueItemById(id: string): Promise<APIResponse<PublishingQueue>> {
    return this.getById<PublishingQueue>('publishing_queue', id)
  }

  async createQueueItem(data: PublishingQueueInsert): Promise<APIResponse<PublishingQueue>> {
    return this.create<PublishingQueue>('publishing_queue', data)
  }

  async updateQueueItem(id: string, data: PublishingQueueUpdate): Promise<APIResponse<PublishingQueue>> {
    return this.update<PublishingQueue>('publishing_queue', id, data)
  }

  async deleteQueueItem(id: string): Promise<APIResponse<void>> {
    return this.delete('publishing_queue', id)
  }

  // Queue status management
  async updateQueueStatus(id: string, status: PublishingQueue['queue_status']): Promise<APIResponse<PublishingQueue>> {
    return this.update<PublishingQueue>('publishing_queue', id, { queue_status: status })
  }

  async markAsPublished(id: string): Promise<APIResponse<PublishingQueue>> {
    return this.update<PublishingQueue>('publishing_queue', id, {
      queue_status: 'published',
      published_at: new Date().toISOString()
    })
  }

  async markAsFailed(id: string, errorMessage: string): Promise<APIResponse<PublishingQueue>> {
    return this.update<PublishingQueue>('publishing_queue', id, {
      queue_status: 'failed',
      error_message: errorMessage
    })
  }

  // Publishing statistics
  async getPublishingStats(userId: string): Promise<APIResponse<PublishingStats>> {
    const response = await supabase
      .from('publishing_queue')
      .select(`
        queue_status,
        channel:user_channels!inner(user_id)
      `)
      .eq('channel.user_id', userId)

    if (response.error) {
      return {
        data: null,
        error: new APIError('Failed to fetch publishing statistics'),
        status: 500
      }
    }

    const queueItems = response.data || []
    const total = queueItems.length
    const published = queueItems.filter(item => item.queue_status === 'published').length

    const stats: PublishingStats = {
      total_queued: queueItems.filter(item => item.queue_status === 'queued').length,
      total_processing: queueItems.filter(item => item.queue_status === 'processing').length,
      total_published: published,
      total_failed: queueItems.filter(item => item.queue_status === 'failed').length,
      success_rate: total > 0 ? (published / total) * 100 : 0
    }

    return {
      data: stats,
      error: null,
      status: 200
    }
  }

  // Bulk operations
  async bulkUpdateQueueStatus(ids: string[], status: PublishingQueue['queue_status']): Promise<APIResponse<PublishingQueue[]>> {
    const response = await supabase
      .from('publishing_queue')
      .update({ queue_status: status })
      .in('id', ids)
      .select()

    return this.handleResponse(response)
  }

  async getNextQueuedItem(): Promise<APIResponse<PublishingQueue | null>> {
    const response = await supabase
      .from('publishing_queue')
      .select('*')
      .eq('queue_status', 'queued')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    return this.handleResponse(response)
  }
}

// Export singleton instance
export const publishingService = new PublishingService() 