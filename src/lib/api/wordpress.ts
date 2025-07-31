import { APIService, APIResponse } from './index'

export interface WordPressCredentials {
  id: string
  user_id: string
  site_url: string
  username: string
  password: string // Will be encrypted
  api_key?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WordPressSite {
  id: string
  user_id: string
  site_url: string
  site_name: string
  description?: string
  categories: WordPressCategory[]
  tags: WordPressTag[]
  total_posts: number
  total_pages: number
  last_sync: string
  created_at: string
  updated_at: string
}

export interface WordPressCategory {
  id: number
  name: string
  slug: string
  description?: string
  count: number
  parent?: number
}

export interface WordPressTag {
  id: number
  name: string
  slug: string
  description?: string
  count: number
}

export interface WordPressPost {
  id: number
  title: string
  content: string
  excerpt: string
  slug: string
  status: 'publish' | 'draft' | 'private' | 'pending'
  categories: WordPressCategory[]
  tags: WordPressTag[]
  author: number
  featured_image?: string
  published_date: string
  modified_date: string
  seo_meta?: {
    title?: string
    description?: string
    keywords?: string[]
  }
}

export interface NicheProfile {
  id: string
  user_id: string
  site_id: string
  niche_name: string
  description: string
  target_audience: string[]
  content_themes: string[]
  tone_of_voice: string
  seo_focus: string[]
  content_frequency: string
  average_word_count: number
  top_performing_topics: string[]
  competitor_analysis: string[]
  created_at: string
  updated_at: string
}

export interface ArticleGenerationRequest {
  niche_profile_id: string
  category_id?: number
  topic?: string
  target_word_count?: number
  seo_keywords?: string[]
  tone?: string
  include_featured_image?: boolean
}

export interface GeneratedArticle {
  id: string
  title: string
  content: string
  excerpt: string
  seo_meta: {
    title: string
    description: string
    keywords: string[]
  }
  featured_image_url?: string
  category_id?: number
  tags: string[]
  word_count: number
  reading_time: number
  generated_at: string
}

export interface ArticleSchedule {
  id: string
  user_id: string
  site_id: string
  category_id?: number
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  custom_interval?: number // in hours
  custom_interval_unit?: 'hours' | 'days' | 'weeks' | 'months'
  next_publish_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class WordPressService extends APIService {
  // WordPress Site Management
  async connectSite(credentials: Omit<WordPressCredentials, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<WordPressSite>> {
    try {
      // Test WordPress connection
      const testResponse = await this.testWordPressConnection(credentials)
      if (testResponse.error) {
        return testResponse
      }

      // Save credentials
      const credsResponse = await supabase
        .from('wordpress_credentials')
        .insert(credentials)
        .select()
        .single()

      if (credsResponse.error) {
        return {
          data: null,
          error: new Error('Failed to save WordPress credentials'),
          status: 500
        }
      }

      // Create site record
      const siteData = {
        user_id: credentials.user_id,
        site_url: credentials.site_url,
        site_name: testResponse.data?.site_name || 'WordPress Site',
        description: testResponse.data?.description,
        categories: testResponse.data?.categories || [],
        tags: testResponse.data?.tags || [],
        total_posts: testResponse.data?.total_posts || 0,
        total_pages: testResponse.data?.total_pages || 0,
        last_sync: new Date().toISOString()
      }

      const siteResponse = await supabase
        .from('wordpress_sites')
        .insert(siteData)
        .select()
        .single()

      return this.handleResponse(siteResponse)
    } catch (error) {
      return {
        data: null,
        error: new Error('Failed to connect WordPress site'),
        status: 500
      }
    }
  }

  async getSites(userId: string): Promise<APIResponse<WordPressSite[]>> {
    const response = await supabase
      .from('wordpress_sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  async getSiteById(siteId: string): Promise<APIResponse<WordPressSite>> {
    return this.getById<WordPressSite>('wordpress_sites', siteId)
  }

  async syncSite(siteId: string): Promise<APIResponse<WordPressSite>> {
    try {
      const siteResponse = await this.getSiteById(siteId)
      if (siteResponse.error || !siteResponse.data) {
        return siteResponse
      }

      const site = siteResponse.data
      const credentials = await this.getCredentials(site.user_id, site.site_url)
      
      if (!credentials) {
        return {
          data: null,
          error: new Error('WordPress credentials not found'),
          status: 404
        }
      }

      // Sync posts, categories, tags
      const syncData = await this.syncWordPressData(credentials)
      
      // Update site with synced data
      const updateResponse = await supabase
        .from('wordpress_sites')
        .update({
          categories: syncData.categories,
          tags: syncData.tags,
          total_posts: syncData.total_posts,
          total_pages: syncData.total_pages,
          last_sync: new Date().toISOString()
        })
        .eq('id', siteId)
        .select()
        .single()

      return this.handleResponse(updateResponse)
    } catch (error) {
      return {
        data: null,
        error: new Error('Failed to sync WordPress site'),
        status: 500
      }
    }
  }

  // Niche Profile Management
  async createNicheProfile(data: Omit<NicheProfile, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<NicheProfile>> {
    return this.create<NicheProfile>('niche_profiles', data)
  }

  async getNicheProfiles(userId: string): Promise<APIResponse<NicheProfile[]>> {
    const response = await supabase
      .from('niche_profiles')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  async updateNicheProfile(id: string, data: Partial<NicheProfile>): Promise<APIResponse<NicheProfile>> {
    return this.update<NicheProfile>('niche_profiles', id, data)
  }

  async analyzeContentForNiche(siteId: string): Promise<APIResponse<NicheProfile>> {
    try {
      const siteResponse = await this.getSiteById(siteId)
      if (siteResponse.error || !siteResponse.data) {
        return siteResponse
      }

      const site = siteResponse.data
      const posts = await this.getPosts(siteId, 50) // Get recent posts for analysis

      if (posts.error || !posts.data) {
        return {
          data: null,
          error: new Error('Failed to fetch posts for analysis'),
          status: 500
        }
      }

      // Analyze content to determine niche
      const nicheAnalysis = await this.performNicheAnalysis(posts.data)
      
      const nicheProfile: Omit<NicheProfile, 'id' | 'created_at' | 'updated_at'> = {
        user_id: site.user_id,
        site_id: siteId,
        niche_name: nicheAnalysis.niche_name,
        description: nicheAnalysis.description,
        target_audience: nicheAnalysis.target_audience,
        content_themes: nicheAnalysis.content_themes,
        tone_of_voice: nicheAnalysis.tone_of_voice,
        seo_focus: nicheAnalysis.seo_focus,
        content_frequency: nicheAnalysis.content_frequency,
        average_word_count: nicheAnalysis.average_word_count,
        top_performing_topics: nicheAnalysis.top_performing_topics,
        competitor_analysis: nicheAnalysis.competitor_analysis
      }

      return this.createNicheProfile(nicheProfile)
    } catch (error) {
      return {
        data: null,
        error: new Error('Failed to analyze content for niche'),
        status: 500
      }
    }
  }

  // Article Generation
  async generateArticle(request: ArticleGenerationRequest): Promise<APIResponse<GeneratedArticle>> {
    try {
      // Get niche profile
      const profileResponse = await supabase
        .from('niche_profiles')
        .select('*')
        .eq('id', request.niche_profile_id)
        .single()

      if (profileResponse.error || !profileResponse.data) {
        return {
          data: null,
          error: new Error('Niche profile not found'),
          status: 404
        }
      }

      const nicheProfile = profileResponse.data

      // Generate article using AI
      const generatedArticle = await this.generateArticleWithAI(request, nicheProfile)
      
      return {
        data: generatedArticle,
        error: null,
        status: 200
      }
    } catch (error) {
      return {
        data: null,
        error: new Error('Failed to generate article'),
        status: 500
      }
    }
  }

  // Article Scheduling
  async createArticleSchedule(data: Omit<ArticleSchedule, 'id' | 'created_at' | 'updated_at'>): Promise<APIResponse<ArticleSchedule>> {
    return this.create<ArticleSchedule>('article_schedules', data)
  }

  async getArticleSchedules(userId: string): Promise<APIResponse<ArticleSchedule[]>> {
    const response = await supabase
      .from('article_schedules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return this.handleResponse(response)
  }

  async updateArticleSchedule(id: string, data: Partial<ArticleSchedule>): Promise<APIResponse<ArticleSchedule>> {
    return this.update<ArticleSchedule>('article_schedules', id, data)
  }

  // WordPress API Integration
  private async testWordPressConnection(credentials: WordPressCredentials): Promise<APIResponse<any>> {
    try {
      // This would make actual WordPress API calls
      // For now, return mock data
      return {
        data: {
          site_name: 'My WordPress Site',
          description: 'A WordPress site',
          categories: [],
          tags: [],
          total_posts: 0,
          total_pages: 0
        },
        error: null,
        status: 200
      }
    } catch (error) {
      return {
        data: null,
        error: new Error('Failed to connect to WordPress site'),
        status: 500
      }
    }
  }

  private async getCredentials(userId: string, siteUrl: string): Promise<WordPressCredentials | null> {
    const response = await supabase
      .from('wordpress_credentials')
      .select('*')
      .eq('user_id', userId)
      .eq('site_url', siteUrl)
      .single()

    return response.data || null
  }

  private async syncWordPressData(credentials: WordPressCredentials): Promise<any> {
    // Mock sync data
    return {
      categories: [],
      tags: [],
      total_posts: 0,
      total_pages: 0
    }
  }

  private async getPosts(siteId: string, limit: number): Promise<APIResponse<WordPressPost[]>> {
    // Mock posts data
    return {
      data: [],
      error: null,
      status: 200
    }
  }

  private async performNicheAnalysis(posts: WordPressPost[]): Promise<any> {
    // Mock niche analysis
    return {
      niche_name: 'Technology',
      description: 'Technology-focused content',
      target_audience: ['Developers', 'Tech enthusiasts'],
      content_themes: ['Programming', 'AI', 'Web Development'],
      tone_of_voice: 'Professional and informative',
      seo_focus: ['technology', 'programming', 'ai'],
      content_frequency: 'weekly',
      average_word_count: 1500,
      top_performing_topics: ['AI', 'Programming'],
      competitor_analysis: ['TechCrunch', 'Wired']
    }
  }

  private async generateArticleWithAI(request: ArticleGenerationRequest, nicheProfile: NicheProfile): Promise<GeneratedArticle> {
    // Mock article generation
    return {
      id: Date.now().toString(),
      title: 'Generated Article Title',
      content: 'Generated article content...',
      excerpt: 'Generated excerpt...',
      seo_meta: {
        title: 'SEO Title',
        description: 'SEO Description',
        keywords: ['keyword1', 'keyword2']
      },
      featured_image_url: undefined,
      category_id: request.category_id,
      tags: request.seo_keywords || [],
      word_count: request.target_word_count || 1000,
      reading_time: Math.ceil((request.target_word_count || 1000) / 200),
      generated_at: new Date().toISOString()
    }
  }
}

// Export singleton instance
export const wordpressService = new WordPressService() 