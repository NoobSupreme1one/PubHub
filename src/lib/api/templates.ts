import { APIService, APIResponse } from './index'
import type { Tables, TablesInsert, TablesUpdate } from './index'

export type CampaignTemplate = Tables<'campaign_templates'>
export type CampaignTemplateInsert = TablesInsert<'campaign_templates'>
export type CampaignTemplateUpdate = TablesUpdate<'campaign_templates'>

export interface TemplateSettings {
  contentStructure?: {
    intro?: boolean
    mainPoints?: number
    conclusion?: boolean
    callToAction?: boolean
  }
  postingSchedule?: {
    frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    bestTimes?: string[]
    timezone?: string
  }
  platformSettings?: {
    facebook?: {
      postLength?: number
      includeHashtags?: boolean
      includeImages?: boolean
    }
    linkedin?: {
      postLength?: number
      includeHashtags?: boolean
      includeImages?: boolean
    }
    twitter?: {
      postLength?: number
      includeHashtags?: boolean
      includeImages?: boolean
    }
    instagram?: {
      postLength?: number
      includeHashtags?: boolean
      includeImages?: boolean
    }
  }
  branding?: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    fontFamily?: string
  }
}

export class TemplateService extends APIService {
  // Template CRUD operations
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

  // Predefined templates
  async createDefaultTemplates(userId: string): Promise<APIResponse<CampaignTemplate[]>> {
    const defaultTemplates: CampaignTemplateInsert[] = [
      {
        name: 'B2B Product Launch',
        description: 'Perfect for launching new B2B products or services with a focus on value proposition and ROI',
        template_type: 'b2b_launch',
        settings: {
          contentStructure: {
            intro: true,
            mainPoints: 3,
            conclusion: true,
            callToAction: true
          },
          postingSchedule: {
            frequency: 'weekly',
            bestTimes: ['09:00', '14:00', '16:00'],
            timezone: 'UTC'
          },
          platformSettings: {
            linkedin: {
              postLength: 1300,
              includeHashtags: true,
              includeImages: true
            },
            facebook: {
              postLength: 400,
              includeHashtags: true,
              includeImages: true
            },
            twitter: {
              postLength: 280,
              includeHashtags: true,
              includeImages: false
            }
          },
          branding: {
            primaryColor: '#2563eb',
            secondaryColor: '#1e40af',
            fontFamily: 'Inter'
          }
        },
        is_public: true,
        created_by: userId
      },
      {
        name: 'Consumer Product Campaign',
        description: 'Ideal for consumer-facing product promotions with engaging visuals and emotional appeal',
        template_type: 'consumer_product',
        settings: {
          contentStructure: {
            intro: true,
            mainPoints: 2,
            conclusion: true,
            callToAction: true
          },
          postingSchedule: {
            frequency: 'daily',
            bestTimes: ['10:00', '15:00', '19:00'],
            timezone: 'UTC'
          },
          platformSettings: {
            instagram: {
              postLength: 2200,
              includeHashtags: true,
              includeImages: true
            },
            facebook: {
              postLength: 400,
              includeHashtags: true,
              includeImages: true
            },
            twitter: {
              postLength: 280,
              includeHashtags: true,
              includeImages: true
            }
          },
          branding: {
            primaryColor: '#ec4899',
            secondaryColor: '#be185d',
            fontFamily: 'Inter'
          }
        },
        is_public: true,
        created_by: userId
      },
      {
        name: 'Thought Leadership',
        description: 'Build authority and share industry insights with educational content and expert positioning',
        template_type: 'thought_leadership',
        settings: {
          contentStructure: {
            intro: true,
            mainPoints: 4,
            conclusion: true,
            callToAction: false
          },
          postingSchedule: {
            frequency: 'biweekly',
            bestTimes: ['08:00', '12:00', '17:00'],
            timezone: 'UTC'
          },
          platformSettings: {
            linkedin: {
              postLength: 1300,
              includeHashtags: true,
              includeImages: false
            },
            twitter: {
              postLength: 280,
              includeHashtags: true,
              includeImages: false
            },
            facebook: {
              postLength: 400,
              includeHashtags: true,
              includeImages: false
            }
          },
          branding: {
            primaryColor: '#059669',
            secondaryColor: '#047857',
            fontFamily: 'Inter'
          }
        },
        is_public: true,
        created_by: userId
      }
    ]

    const results = []
    for (const template of defaultTemplates) {
      const result = await this.createTemplate(template)
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

  // Template customization
  async duplicateTemplate(templateId: string, newName: string, userId: string): Promise<APIResponse<CampaignTemplate>> {
    const templateResponse = await this.getTemplateById(templateId)
    if (templateResponse.error || !templateResponse.data) {
      return templateResponse
    }

    const originalTemplate = templateResponse.data
    const newTemplateData: CampaignTemplateInsert = {
      name: newName,
      description: originalTemplate.description,
      template_type: originalTemplate.template_type,
      settings: originalTemplate.settings,
      is_public: false,
      created_by: userId
    }

    return this.createTemplate(newTemplateData)
  }

  // Template validation
  validateTemplateSettings(settings: TemplateSettings): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!settings.contentStructure) {
      errors.push('Content structure is required')
    }

    if (!settings.postingSchedule) {
      errors.push('Posting schedule is required')
    }

    if (!settings.platformSettings) {
      errors.push('Platform settings are required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Get template recommendations based on industry
  async getTemplateRecommendations(industry: string): Promise<APIResponse<CampaignTemplate[]>> {
    const industryTemplates: Record<string, string[]> = {
      'technology': ['b2b_launch', 'thought_leadership'],
      'healthcare': ['thought_leadership', 'b2b_launch'],
      'finance': ['thought_leadership', 'b2b_launch'],
      'retail': ['consumer_product', 'b2b_launch'],
      'education': ['thought_leadership', 'b2b_launch'],
      'manufacturing': ['b2b_launch', 'thought_leadership'],
      'consulting': ['thought_leadership', 'b2b_launch'],
      'marketing': ['consumer_product', 'thought_leadership'],
      'real-estate': ['consumer_product', 'b2b_launch'],
      'food-beverage': ['consumer_product', 'b2b_launch']
    }

    const recommendedTypes = industryTemplates[industry] || ['b2b_launch', 'consumer_product', 'thought_leadership']
    
    const response = await supabase
      .from('campaign_templates')
      .select('*')
      .in('template_type', recommendedTypes)
      .eq('is_public', true)

    return this.handleResponse(response)
  }
}

// Export singleton instance
export const templateService = new TemplateService() 