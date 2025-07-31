// Environment configuration interface
export interface AppConfig {
  // Supabase configuration
  supabase: {
    url: string
    anonKey: string
  }
  
  // API configuration
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }
  
  // Feature flags
  features: {
    contentAdaptation: boolean
    aiGeneration: boolean
    analytics: boolean
    realTimeUpdates: boolean
  }
  
  // External services
  services: {
    googleGemini: {
      apiKey: string
      enabled: boolean
    }
    unsplash: {
      accessKey: string
      enabled: boolean
    }
    resend: {
      apiKey: string
      enabled: boolean
    }
    stripe: {
      publishableKey: string
      enabled: boolean
    }
    sentry: {
      dsn: string
      enabled: boolean
    }
  }
  
  // Social media platforms
  platforms: {
    facebook: {
      appId: string
      appSecret: string
      enabled: boolean
    }
    linkedin: {
      clientId: string
      clientSecret: string
      enabled: boolean
    }
    twitter: {
      apiKey: string
      apiSecret: string
      enabled: boolean
    }
    instagram: {
      appId: string
      appSecret: string
      enabled: boolean
    }
    pinterest: {
      appId: string
      appSecret: string
      enabled: boolean
    }
  }
  
  // App settings
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    debug: boolean
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
}

// Default configuration
const defaultConfig: AppConfig = {
  supabase: {
    url: '',
    anonKey: ''
  },
  api: {
    baseUrl: '/api',
    timeout: 30000,
    retryAttempts: 3
  },
  features: {
    contentAdaptation: true,
    aiGeneration: true,
    analytics: true,
    realTimeUpdates: true
  },
  services: {
    googleGemini: {
      apiKey: '',
      enabled: false
    },
    unsplash: {
      accessKey: '',
      enabled: false
    },
    resend: {
      apiKey: '',
      enabled: false
    },
    stripe: {
      publishableKey: '',
      enabled: false
    },
    sentry: {
      dsn: '',
      enabled: false
    }
  },
  platforms: {
    facebook: {
      appId: '',
      appSecret: '',
      enabled: false
    },
    linkedin: {
      clientId: '',
      clientSecret: '',
      enabled: false
    },
    twitter: {
      apiKey: '',
      apiSecret: '',
      enabled: false
    },
    instagram: {
      appId: '',
      appSecret: '',
      enabled: false
    },
    pinterest: {
      appId: '',
      appSecret: '',
      enabled: false
    }
  },
  app: {
    name: 'PubHub',
    version: '1.0.0',
    environment: 'development',
    debug: false,
    logLevel: 'info'
  }
}

// Environment variable mapping
const envMapping = {
  // Supabase
  'VITE_SUPABASE_URL': 'supabase.url',
  'VITE_SUPABASE_ANON_KEY': 'supabase.anonKey',
  
  // API
  'VITE_API_BASE_URL': 'api.baseUrl',
  'VITE_API_TIMEOUT': 'api.timeout',
  'VITE_API_RETRY_ATTEMPTS': 'api.retryAttempts',
  
  // Features
  'VITE_FEATURE_CONTENT_ADAPTATION': 'features.contentAdaptation',
  'VITE_FEATURE_AI_GENERATION': 'features.aiGeneration',
  'VITE_FEATURE_ANALYTICS': 'features.analytics',
  'VITE_FEATURE_REAL_TIME_UPDATES': 'features.realTimeUpdates',
  
  // Services
  'VITE_GOOGLE_GEMINI_API_KEY': 'services.googleGemini.apiKey',
  'VITE_GOOGLE_GEMINI_ENABLED': 'services.googleGemini.enabled',
  'VITE_UNSPLASH_ACCESS_KEY': 'services.unsplash.accessKey',
  'VITE_UNSPLASH_ENABLED': 'services.unsplash.enabled',
  'VITE_RESEND_API_KEY': 'services.resend.apiKey',
  'VITE_RESEND_ENABLED': 'services.resend.enabled',
  'VITE_STRIPE_PUBLISHABLE_KEY': 'services.stripe.publishableKey',
  'VITE_STRIPE_ENABLED': 'services.stripe.enabled',
  'VITE_SENTRY_DSN': 'services.sentry.dsn',
  'VITE_SENTRY_ENABLED': 'services.sentry.enabled',
  
  // Platforms
  'VITE_FACEBOOK_APP_ID': 'platforms.facebook.appId',
  'VITE_FACEBOOK_APP_SECRET': 'platforms.facebook.appSecret',
  'VITE_FACEBOOK_ENABLED': 'platforms.facebook.enabled',
  'VITE_LINKEDIN_CLIENT_ID': 'platforms.linkedin.clientId',
  'VITE_LINKEDIN_CLIENT_SECRET': 'platforms.linkedin.clientSecret',
  'VITE_LINKEDIN_ENABLED': 'platforms.linkedin.enabled',
  'VITE_TWITTER_API_KEY': 'platforms.twitter.apiKey',
  'VITE_TWITTER_API_SECRET': 'platforms.twitter.apiSecret',
  'VITE_TWITTER_ENABLED': 'platforms.twitter.enabled',
  'VITE_INSTAGRAM_APP_ID': 'platforms.instagram.appId',
  'VITE_INSTAGRAM_APP_SECRET': 'platforms.instagram.appSecret',
  'VITE_INSTAGRAM_ENABLED': 'platforms.instagram.enabled',
  'VITE_PINTEREST_APP_ID': 'platforms.pinterest.appId',
  'VITE_PINTEREST_APP_SECRET': 'platforms.pinterest.appSecret',
  'VITE_PINTEREST_ENABLED': 'platforms.pinterest.enabled',
  
  // App
  'VITE_APP_NAME': 'app.name',
  'VITE_APP_VERSION': 'app.version',
  'VITE_APP_ENVIRONMENT': 'app.environment',
  'VITE_APP_DEBUG': 'app.debug',
  'VITE_APP_LOG_LEVEL': 'app.logLevel'
}

// Configuration manager class
export class ConfigManager {
  private config: AppConfig

  constructor() {
    this.config = this.loadConfig()
  }

  // Load configuration from environment variables
  private loadConfig(): AppConfig {
    const config = { ...defaultConfig }

    // Override with environment variables
    Object.entries(envMapping).forEach(([envKey, configPath]) => {
      const envValue = import.meta.env[envKey]
      if (envValue !== undefined) {
        this.setNestedValue(config, configPath, this.parseEnvValue(envValue))
      }
    })

    return config
  }

  // Set nested object value by path
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  // Parse environment variable value
  private parseEnvValue(value: string): any {
    // Handle boolean values
    if (value === 'true') return true
    if (value === 'false') return false
    
    // Handle numeric values
    if (!isNaN(Number(value))) return Number(value)
    
    // Handle arrays (comma-separated)
    if (value.includes(',')) return value.split(',').map(v => v.trim())
    
    // Return as string
    return value
  }

  // Get configuration
  get(): AppConfig {
    return this.config
  }

  // Get specific configuration section
  getSection<T extends keyof AppConfig>(section: T): AppConfig[T] {
    return this.config[section]
  }

  // Get nested configuration value
  getValue(path: string): any {
    const keys = path.split('.')
    let current: any = this.config

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature]
  }

  // Check if service is enabled
  isServiceEnabled(service: keyof AppConfig['services']): boolean {
    return this.config.services[service].enabled
  }

  // Check if platform is enabled
  isPlatformEnabled(platform: keyof AppConfig['platforms']): boolean {
    return this.config.platforms[platform].enabled
  }

  // Get environment
  getEnvironment(): AppConfig['app']['environment'] {
    return this.config.app.environment
  }

  // Check if in development
  isDevelopment(): boolean {
    return this.config.app.environment === 'development'
  }

  // Check if in production
  isProduction(): boolean {
    return this.config.app.environment === 'production'
  }

  // Check if debug is enabled
  isDebugEnabled(): boolean {
    return this.config.app.debug
  }

  // Get log level
  getLogLevel(): AppConfig['app']['logLevel'] {
    return this.config.app.logLevel
  }

  // Validate configuration
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate required Supabase configuration
    if (!this.config.supabase.url) {
      errors.push('Supabase URL is required')
    }
    if (!this.config.supabase.anonKey) {
      errors.push('Supabase anonymous key is required')
    }

    // Validate API configuration
    if (this.config.api.timeout <= 0) {
      errors.push('API timeout must be greater than 0')
    }
    if (this.config.api.retryAttempts < 0) {
      errors.push('API retry attempts must be non-negative')
    }

    // Validate environment
    if (!['development', 'staging', 'production'].includes(this.config.app.environment)) {
      errors.push('Invalid environment value')
    }

    // Validate log level
    if (!['error', 'warn', 'info', 'debug'].includes(this.config.app.logLevel)) {
      errors.push('Invalid log level')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Reload configuration (useful for testing)
  reload(): void {
    this.config = this.loadConfig()
  }

  // Get configuration for specific environment
  getEnvironmentConfig(environment: AppConfig['app']['environment']): Partial<AppConfig> {
    const envConfig: Partial<AppConfig> = {}

    // Override with environment-specific values
    Object.entries(envMapping).forEach(([envKey, configPath]) => {
      const envValue = import.meta.env[envKey]
      if (envValue !== undefined) {
        this.setNestedValue(envConfig, configPath, this.parseEnvValue(envValue))
      }
    })

    return envConfig
  }
}

// Global configuration instance
export const config = new ConfigManager()

// Export configuration getters for convenience
export const getConfig = () => config.get()
export const getSupabaseConfig = () => config.getSection('supabase')
export const getApiConfig = () => config.getSection('api')
export const getFeaturesConfig = () => config.getSection('features')
export const getServicesConfig = () => config.getSection('services')
export const getPlatformsConfig = () => config.getSection('platforms')
export const getAppConfig = () => config.getSection('app')

// Export utility functions
export const isFeatureEnabled = (feature: keyof AppConfig['features']) => config.isFeatureEnabled(feature)
export const isServiceEnabled = (service: keyof AppConfig['services']) => config.isServiceEnabled(service)
export const isPlatformEnabled = (platform: keyof AppConfig['platforms']) => config.isPlatformEnabled(platform)
export const isDevelopment = () => config.isDevelopment()
export const isProduction = () => config.isProduction()
export const isDebugEnabled = () => config.isDebugEnabled()
export const getLogLevel = () => config.getLogLevel()

// Validate configuration on load
const validation = config.validate()
if (!validation.isValid) {
  console.error('Configuration validation failed:', validation.errors)
  if (isProduction()) {
    throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`)
  }
} 