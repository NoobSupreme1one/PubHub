import { APIService, APIResponse } from './index'
import type { Tables, TablesInsert, TablesUpdate } from './index'

export type Platform = Tables<'platforms'>
export type UserChannel = Tables<'user_channels'>
export type UserChannelInsert = TablesInsert<'user_channels'>
export type UserChannelUpdate = TablesUpdate<'user_channels'>

export type ChannelToken = Tables<'channel_tokens'>
export type ChannelTokenInsert = TablesInsert<'channel_tokens'>
export type ChannelPermission = Tables<'channel_permissions'>

export interface ChannelWithDetails extends UserChannel {
  platform?: Platform
  token?: ChannelToken
  permissions?: ChannelPermission[]
}

export interface ChannelStats {
  total_channels: number
  connected_channels: number
  error_channels: number
  disconnected_channels: number
  total_followers: number
}

export class ChannelService extends APIService {
  // Platform operations
  async getPlatforms(): Promise<APIResponse<Platform[]>> {
    const response = await supabase
      .from('platforms')
      .select('*')
      .eq('is_active', true)
      .order('display_name')

    return this.handleResponse(response)
  }

  async getPlatformById(id: string): Promise<APIResponse<Platform>> {
    return this.getById<Platform>('platforms', id)
  }

  async getPlatformByName(name: string): Promise<APIResponse<Platform>> {
    const response = await supabase
      .from('platforms')
      .select('*')
      .eq('name', name)
      .single()

    return this.handleResponse(response)
  }

  // User channels operations
  async getUserChannels(userId: string): Promise<APIResponse<UserChannel[]>> {
    return this.get<UserChannel>('user_channels', { user_id: userId })
  }

  async getChannelById(id: string): Promise<APIResponse<UserChannel>> {
    return this.getById<UserChannel>('user_channels', id)
  }

  async createChannel(data: UserChannelInsert): Promise<APIResponse<UserChannel>> {
    return this.create<UserChannel>('user_channels', data)
  }

  async updateChannel(id: string, data: UserChannelUpdate): Promise<APIResponse<UserChannel>> {
    return this.update<UserChannel>('user_channels', id, data)
  }

  async deleteChannel(id: string): Promise<APIResponse<void>> {
    return this.delete('user_channels', id)
  }

  // Channel with details
  async getChannelWithDetails(id: string): Promise<APIResponse<ChannelWithDetails>> {
    const response = await supabase
      .from('user_channels')
      .select(`
        *,
        platform:platforms(*),
        token:channel_tokens(*),
        permissions:channel_permissions(*)
      `)
      .eq('id', id)
      .single()

    return this.handleResponse(response)
  }

  async getUserChannelsWithDetails(userId: string): Promise<APIResponse<ChannelWithDetails[]>> {
    const response = await supabase
      .from('user_channels')
      .select(`
        *,
        platform:platforms(*),
        token:channel_tokens(*),
        permissions:channel_permissions(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  // Channel tokens
  async getChannelToken(channelId: string): Promise<APIResponse<ChannelToken>> {
    const response = await supabase
      .from('channel_tokens')
      .select('*')
      .eq('channel_id', channelId)
      .single()

    return this.handleResponse(response)
  }

  async createChannelToken(data: ChannelTokenInsert): Promise<APIResponse<ChannelToken>> {
    return this.create<ChannelToken>('channel_tokens', data)
  }

  async updateChannelToken(channelId: string, data: Partial<ChannelTokenInsert>): Promise<APIResponse<ChannelToken>> {
    const response = await supabase
      .from('channel_tokens')
      .update(data)
      .eq('channel_id', channelId)
      .select()
      .single()

    return this.handleResponse(response)
  }

  async deleteChannelToken(channelId: string): Promise<APIResponse<void>> {
    const response = await supabase
      .from('channel_tokens')
      .delete()
      .eq('channel_id', channelId)

    return this.handleResponse(response)
  }

  // Channel permissions
  async getChannelPermissions(channelId: string): Promise<APIResponse<ChannelPermission[]>> {
    return this.get<ChannelPermission>('channel_permissions', { channel_id: channelId })
  }

  async updateChannelPermission(channelId: string, permissionName: string, isGranted: boolean): Promise<APIResponse<ChannelPermission>> {
    const response = await supabase
      .from('channel_permissions')
      .upsert({
        channel_id: channelId,
        permission_name: permissionName,
        is_granted: isGranted
      })
      .select()
      .single()

    return this.handleResponse(response)
  }

  async deleteChannelPermission(channelId: string, permissionName: string): Promise<APIResponse<void>> {
    const response = await supabase
      .from('channel_permissions')
      .delete()
      .eq('channel_id', channelId)
      .eq('permission_name', permissionName)

    return this.handleResponse(response)
  }

  // Channel status management
  async updateChannelStatus(channelId: string, status: UserChannel['status']): Promise<APIResponse<UserChannel>> {
    return this.update<UserChannel>('user_channels', channelId, { status })
  }

  async updateChannelFollowerCount(channelId: string, followerCount: number): Promise<APIResponse<UserChannel>> {
    return this.update<UserChannel>('user_channels', channelId, { 
      follower_count: followerCount,
      last_sync_at: new Date().toISOString()
    })
  }

  // Channel statistics
  async getChannelStats(userId: string): Promise<APIResponse<ChannelStats>> {
    const response = await supabase
      .from('user_channels')
      .select('status, follower_count')
      .eq('user_id', userId)

    if (response.error) {
      return {
        data: null,
        error: new APIError('Failed to fetch channel statistics'),
        status: 500
      }
    }

    const channels = response.data || []
    const totalFollowers = channels.reduce((sum, channel) => sum + (channel.follower_count || 0), 0)

    const stats: ChannelStats = {
      total_channels: channels.length,
      connected_channels: channels.filter(c => c.status === 'connected').length,
      error_channels: channels.filter(c => c.status === 'error').length,
      disconnected_channels: channels.filter(c => c.status === 'disconnected').length,
      total_followers: totalFollowers
    }

    return {
      data: stats,
      error: null,
      status: 200
    }
  }

  // Channel validation
  async validateChannelConnection(channelId: string): Promise<APIResponse<boolean>> {
    const tokenResponse = await this.getChannelToken(channelId)
    if (tokenResponse.error || !tokenResponse.data) {
      return {
        data: false,
        error: null,
        status: 200
      }
    }

    const token = tokenResponse.data
    const now = new Date()

    // Check if token is expired
    if (token.expires_at && new Date(token.expires_at) < now) {
      await this.updateChannelStatus(channelId, 'expired')
      return {
        data: false,
        error: null,
        status: 200
      }
    }

    return {
      data: true,
      error: null,
      status: 200
    }
  }

  // Bulk operations
  async bulkUpdateChannelStatus(channelIds: string[], status: UserChannel['status']): Promise<APIResponse<UserChannel[]>> {
    const response = await supabase
      .from('user_channels')
      .update({ status })
      .in('id', channelIds)
      .select()

    return this.handleResponse(response)
  }

  async disconnectAllChannels(userId: string): Promise<APIResponse<void>> {
    const response = await supabase
      .from('user_channels')
      .update({ status: 'disconnected' })
      .eq('user_id', userId)

    return this.handleResponse(response)
  }

  // Platform-specific operations
  async getChannelsByPlatform(userId: string, platformId: string): Promise<APIResponse<UserChannel[]>> {
    return this.get<UserChannel>('user_channels', { 
      user_id: userId,
      platform_id: platformId
    })
  }

  async getChannelsByStatus(userId: string, status: UserChannel['status']): Promise<APIResponse<UserChannel[]>> {
    return this.get<UserChannel>('user_channels', { 
      user_id: userId,
      status: status
    })
  }
}

// Export singleton instance
export const channelService = new ChannelService() 