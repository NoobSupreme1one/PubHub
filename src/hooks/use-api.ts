import { useState, useEffect, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { APIResponse } from '@/lib/api'
import { errorHandler, getErrorContext } from '@/lib/error-handling'

// Generic API hook options
export interface UseApiOptions<T> {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
  cacheTime?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  retry?: boolean | number
}

// Generic API hook for queries
export function useApiQuery<T>(
  key: string | string[],
  queryFn: () => Promise<APIResponse<T>>,
  options: UseApiOptions<T> = {}
) {
  const {
    enabled = true,
    refetchInterval,
    staleTime,
    cacheTime,
    onSuccess,
    onError,
    retry = 3
  } = options

  const queryKey = useMemo(() => (Array.isArray(key) ? key : [key]), [key])

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await queryFn()
        if (response.error) {
          throw new Error(response.error.message)
        }
        return response.data
      } catch (error) {
        const context = getErrorContext()
        errorHandler.handleAsyncError(error as Error, context)
        throw error
      }
    },
    enabled,
    refetchInterval,
    staleTime,
    gcTime: cacheTime,
    retry,
    onSuccess,
    onError
  })
}

// Generic API hook for mutations
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<APIResponse<TData>>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
  } = {}
) {
  const queryClient = useQueryClient()
  const { onSuccess, onError, onSettled } = options

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      try {
        const response = await mutationFn(variables)
        if (response.error) {
          throw new Error(response.error.message)
        }
        return response.data
      } catch (error) {
        const context = getErrorContext()
        errorHandler.handleAsyncError(error as Error, context)
        throw error
      }
    },
    onSuccess,
    onError,
    onSettled
  })
}

// Campaign hooks
export function useCampaigns(userId: string, options?: UseApiOptions<any[]>) {
  const { campaignService } = require('@/lib/api/campaigns')
  
  return useApiQuery(
    ['campaigns', userId],
    () => campaignService.getCampaigns(userId),
    options
  )
}

export function useCampaign(campaignId: string, options?: UseApiOptions<any>) {
  const { campaignService } = require('@/lib/api/campaigns')
  
  return useApiQuery(
    ['campaign', campaignId],
    () => campaignService.getCampaignById(campaignId),
    {
      enabled: !!campaignId,
      ...options
    }
  )
}

export function useCampaignWithDetails(campaignId: string, options?: UseApiOptions<any>) {
  const { campaignService } = require('@/lib/api/campaigns')
  
  return useApiQuery(
    ['campaign-with-details', campaignId],
    () => campaignService.getCampaignWithDetails(campaignId),
    {
      enabled: !!campaignId,
      ...options
    }
  )
}

export function useCampaignStats(userId: string, options?: UseApiOptions<any>) {
  const { campaignService } = require('@/lib/api/campaigns')
  
  return useApiQuery(
    ['campaign-stats', userId],
    () => campaignService.getCampaignStats(userId),
    options
  )
}

export function useCreateCampaign() {
  const { campaignService } = require('@/lib/api/campaigns')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (data: any) => campaignService.createCampaign(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    }
  )
}

export function useUpdateCampaign() {
  const { campaignService } = require('@/lib/api/campaigns')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => campaignService.updateCampaign(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
        queryClient.invalidateQueries({ queryKey: ['campaign', id] })
      }
    }
  )
}

export function useDeleteCampaign() {
  const { campaignService } = require('@/lib/api/campaigns')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (id: string) => campaignService.deleteCampaign(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      }
    }
  )
}

// Template hooks
export function useTemplates(isPublic?: boolean, options?: UseApiOptions<any[]>) {
  const { templateService } = require('@/lib/api/templates')
  
  return useApiQuery(
    ['templates', isPublic],
    () => templateService.getTemplates(isPublic),
    options
  )
}

export function useTemplate(templateId: string, options?: UseApiOptions<any>) {
  const { templateService } = require('@/lib/api/templates')
  
  return useApiQuery(
    ['template', templateId],
    () => templateService.getTemplateById(templateId),
    {
      enabled: !!templateId,
      ...options
    }
  )
}

export function useCreateTemplate() {
  const { templateService } = require('@/lib/api/templates')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (data: any) => templateService.createTemplate(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['templates'] })
      }
    }
  )
}

export function useUpdateTemplate() {
  const { templateService } = require('@/lib/api/templates')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => templateService.updateTemplate(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['templates'] })
        queryClient.invalidateQueries({ queryKey: ['template', id] })
      }
    }
  )
}

export function useDeleteTemplate() {
  const { templateService } = require('@/lib/api/templates')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (id: string) => templateService.deleteTemplate(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['templates'] })
      }
    }
  )
}

// Channel hooks
export function useChannels(userId: string, options?: UseApiOptions<any[]>) {
  const { channelService } = require('@/lib/api/channels')
  
  return useApiQuery(
    ['channels', userId],
    () => channelService.getUserChannels(userId),
    options
  )
}

export function useChannel(channelId: string, options?: UseApiOptions<any>) {
  const { channelService } = require('@/lib/api/channels')
  
  return useApiQuery(
    ['channel', channelId],
    () => channelService.getChannelById(channelId),
    {
      enabled: !!channelId,
      ...options
    }
  )
}

export function useChannelStats(userId: string, options?: UseApiOptions<any>) {
  const { channelService } = require('@/lib/api/channels')
  
  return useApiQuery(
    ['channel-stats', userId],
    () => channelService.getChannelStats(userId),
    options
  )
}

export function usePlatforms(options?: UseApiOptions<any[]>) {
  const { channelService } = require('@/lib/api/channels')
  
  return useApiQuery(
    ['platforms'],
    () => channelService.getPlatforms(),
    options
  )
}

export function useCreateChannel() {
  const { channelService } = require('@/lib/api/channels')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (data: any) => channelService.createChannel(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['channels'] })
      }
    }
  )
}

export function useUpdateChannel() {
  const { channelService } = require('@/lib/api/channels')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => channelService.updateChannel(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['channels'] })
        queryClient.invalidateQueries({ queryKey: ['channel', id] })
      }
    }
  )
}

export function useDeleteChannel() {
  const { channelService } = require('@/lib/api/channels')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (id: string) => channelService.deleteChannel(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['channels'] })
      }
    }
  )
}

// Content hooks
export function useContent(userId: string, options?: UseApiOptions<any[]>) {
  const { contentService } = require('@/lib/api/content')
  
  return useApiQuery(
    ['content', userId],
    () => contentService.getContentPieces(userId),
    options
  )
}

export function useContentPiece(contentId: string, options?: UseApiOptions<any>) {
  const { contentService } = require('@/lib/api/content')
  
  return useApiQuery(
    ['content-piece', contentId],
    () => contentService.getContentById(contentId),
    {
      enabled: !!contentId,
      ...options
    }
  )
}

export function useContentStats(userId: string, options?: UseApiOptions<any>) {
  const { contentService } = require('@/lib/api/content')
  
  return useApiQuery(
    ['content-stats', userId],
    () => contentService.getContentStats(userId),
    options
  )
}

export function useCreateContent() {
  const { contentService } = require('@/lib/api/content')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (data: any) => contentService.createContent(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] })
      }
    }
  )
}

export function useUpdateContent() {
  const { contentService } = require('@/lib/api/content')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    ({ id, data }: { id: string; data: any }) => contentService.updateContent(id, data),
    {
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({ queryKey: ['content'] })
        queryClient.invalidateQueries({ queryKey: ['content-piece', id] })
      }
    }
  )
}

export function useDeleteContent() {
  const { contentService } = require('@/lib/api/content')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    (id: string) => contentService.deleteContent(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['content'] })
      }
    }
  )
}

// Publishing hooks
export function usePublishingQueue(userId: string, options?: UseApiOptions<any[]>) {
  const { publishingService } = require('@/lib/api/publishing')
  
  return useApiQuery(
    ['publishing-queue', userId],
    () => publishingService.getPublishingQueue(userId),
    options
  )
}

export function usePublishingStats(userId: string, options?: UseApiOptions<any>) {
  const { publishingService } = require('@/lib/api/publishing')
  
  return useApiQuery(
    ['publishing-stats', userId],
    () => publishingService.getPublishingStats(userId),
    options
  )
}

export function useUpdateQueueStatus() {
  const { publishingService } = require('@/lib/api/publishing')
  const queryClient = useQueryClient()
  
  return useApiMutation(
    ({ id, status }: { id: string; status: string }) => publishingService.updateQueueStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['publishing-queue'] })
        queryClient.invalidateQueries({ queryKey: ['publishing-stats'] })
      }
    }
  )
}

// Utility hooks
export function useOptimisticUpdate<T>(
  queryKey: string | string[],
  updateFn: (oldData: T | undefined, newData: any) => T
) {
  const queryClient = useQueryClient()
  const key = useMemo(() => (Array.isArray(queryKey) ? queryKey : [queryKey]), [queryKey])

  const optimisticUpdate = useCallback(
    (newData: any) => {
      queryClient.setQueryData(key, (oldData: T | undefined) => updateFn(oldData, newData))
    },
    [queryClient, key, updateFn]
  )

  const rollback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: key })
  }, [queryClient, key])

  return { optimisticUpdate, rollback }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
} 