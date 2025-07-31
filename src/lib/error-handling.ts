import { APIError } from './api'

// Error types
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  EXTERNAL_API = 'EXTERNAL_API',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Error context interface
export interface ErrorContext {
  userId?: string
  action?: string
  resource?: string
  metadata?: Record<string, any>
  timestamp: string
  userAgent?: string
  url?: string
}

// Enhanced error class
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly severity: ErrorSeverity
  public readonly context: ErrorContext
  public readonly originalError?: Error
  public readonly isOperational: boolean

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    originalError?: Error,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.severity = severity
    this.context = {
      timestamp: new Date().toISOString(),
      ...context
    }
    this.originalError = originalError
    this.isOperational = isOperational

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  // Convert APIError to AppError
  static fromAPIError(apiError: APIError, context?: Partial<ErrorContext>): AppError {
    let type = ErrorType.UNKNOWN
    let severity = ErrorSeverity.MEDIUM

    // Map API error status codes to error types
    switch (apiError.status) {
      case 400:
        type = ErrorType.VALIDATION
        severity = ErrorSeverity.LOW
        break
      case 401:
        type = ErrorType.AUTHENTICATION
        severity = ErrorSeverity.MEDIUM
        break
      case 403:
        type = ErrorType.AUTHORIZATION
        severity = ErrorSeverity.MEDIUM
        break
      case 404:
        type = ErrorType.NOT_FOUND
        severity = ErrorSeverity.LOW
        break
      case 409:
        type = ErrorType.CONFLICT
        severity = ErrorSeverity.MEDIUM
        break
      case 429:
        type = ErrorType.RATE_LIMIT
        severity = ErrorSeverity.MEDIUM
        break
      case 500:
        type = ErrorType.DATABASE
        severity = ErrorSeverity.HIGH
        break
      default:
        type = ErrorType.UNKNOWN
        severity = ErrorSeverity.MEDIUM
    }

    return new AppError(
      apiError.message,
      type,
      severity,
      context,
      apiError
    )
  }

  // Create validation error
  static validation(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.VALIDATION, ErrorSeverity.LOW, context)
  }

  // Create authentication error
  static authentication(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, context)
  }

  // Create authorization error
  static authorization(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, context)
  }

  // Create not found error
  static notFound(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.NOT_FOUND, ErrorSeverity.LOW, context)
  }

  // Create conflict error
  static conflict(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.CONFLICT, ErrorSeverity.MEDIUM, context)
  }

  // Create rate limit error
  static rateLimit(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, context)
  }

  // Create network error
  static network(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.NETWORK, ErrorSeverity.HIGH, context)
  }

  // Create database error
  static database(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.DATABASE, ErrorSeverity.HIGH, context)
  }

  // Create external API error
  static externalAPI(message: string, context?: Partial<ErrorContext>): AppError {
    return new AppError(message, ErrorType.EXTERNAL_API, ErrorSeverity.HIGH, context)
  }

  // Serialize error for logging
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      stack: this.stack,
      originalError: this.originalError?.message
    }
  }
}

// Error logger interface
export interface ErrorLogger {
  log(error: AppError): void
  logError(error: Error, context?: Partial<ErrorContext>): void
  logWarning(message: string, context?: Partial<ErrorContext>): void
  logInfo(message: string, context?: Partial<ErrorContext>): void
}

// Console error logger implementation
export class ConsoleErrorLogger implements ErrorLogger {
  log(error: AppError): void {
    const logData = {
      timestamp: new Date().toISOString(),
      level: this.getLogLevel(error.severity),
      error: error.toJSON()
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('🚨 CRITICAL/HIGH ERROR:', logData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM ERROR:', logData)
        break
      case ErrorSeverity.LOW:
        console.info('ℹ️ LOW ERROR:', logData)
        break
    }
  }

  logError(error: Error, context?: Partial<ErrorContext>): void {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      context,
      error
    )
    this.log(appError)
  }

  logWarning(message: string, context?: Partial<ErrorContext>): void {
    console.warn('⚠️ WARNING:', {
      timestamp: new Date().toISOString(),
      message,
      context: {
        timestamp: new Date().toISOString(),
        ...context
      }
    })
  }

  logInfo(message: string, context?: Partial<ErrorContext>): void {
    console.info('ℹ️ INFO:', {
      timestamp: new Date().toISOString(),
      message,
      context: {
        timestamp: new Date().toISOString(),
        ...context
      }
    })
  }

  private getLogLevel(severity: ErrorSeverity): string {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'CRITICAL'
      case ErrorSeverity.HIGH:
        return 'ERROR'
      case ErrorSeverity.MEDIUM:
        return 'WARN'
      case ErrorSeverity.LOW:
        return 'INFO'
      default:
        return 'INFO'
    }
  }
}

// Error handler class
export class ErrorHandler {
  private logger: ErrorLogger
  private isDevelopment: boolean

  constructor(logger: ErrorLogger = new ConsoleErrorLogger(), isDevelopment: boolean = false) {
    this.logger = logger
    this.isDevelopment = isDevelopment
  }

  // Handle and log error
  handleError(error: Error | AppError, context?: Partial<ErrorContext>): void {
    const appError = error instanceof AppError ? error : new AppError(
      error.message,
      ErrorType.UNKNOWN,
      ErrorSeverity.MEDIUM,
      context,
      error
    )

    this.logger.log(appError)

    // In development, re-throw the error for debugging
    if (this.isDevelopment && appError.severity === ErrorSeverity.CRITICAL) {
      throw appError
    }
  }

  // Handle async errors
  handleAsyncError(error: Error | AppError, context?: Partial<ErrorContext>): void {
    this.handleError(error, context)
  }

  // Create error boundary handler for React
  createErrorBoundaryHandler() {
    return (error: Error, errorInfo: React.ErrorInfo) => {
      const context: Partial<ErrorContext> = {
        action: 'React Error Boundary',
        metadata: {
          componentStack: errorInfo.componentStack
        }
      }

      this.handleError(error, context)
    }
  }

  // Handle API errors
  handleAPIError(apiError: APIError, context?: Partial<ErrorContext>): AppError {
    const appError = AppError.fromAPIError(apiError, context)
    this.logger.log(appError)
    return appError
  }

  // Handle validation errors
  handleValidationError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.validation(message, context)
    this.logger.log(error)
    return error
  }

  // Handle authentication errors
  handleAuthError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.authentication(message, context)
    this.logger.log(error)
    return error
  }

  // Handle authorization errors
  handleAuthzError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.authorization(message, context)
    this.logger.log(error)
    return error
  }

  // Handle not found errors
  handleNotFoundError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.notFound(message, context)
    this.logger.log(error)
    return error
  }

  // Handle conflict errors
  handleConflictError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.conflict(message, context)
    this.logger.log(error)
    return error
  }

  // Handle rate limit errors
  handleRateLimitError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.rateLimit(message, context)
    this.logger.log(error)
    return error
  }

  // Handle network errors
  handleNetworkError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.network(message, context)
    this.logger.log(error)
    return error
  }

  // Handle database errors
  handleDatabaseError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.database(message, context)
    this.logger.log(error)
    return error
  }

  // Handle external API errors
  handleExternalAPIError(message: string, context?: Partial<ErrorContext>): AppError {
    const error = AppError.externalAPI(message, context)
    this.logger.log(error)
    return error
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler(
  new ConsoleErrorLogger(),
  process.env.NODE_ENV === 'development'
)

// Utility function to get error context from current environment
export function getErrorContext(): Partial<ErrorContext> {
  return {
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: new Date().toISOString()
  }
}

// Utility function to wrap async functions with error handling
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: Partial<ErrorContext>
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.handleAsyncError(error as Error, context)
      throw error
    }
  }
} 