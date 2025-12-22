/**
 * Centralized logging utility for Indlela app
 * Provides structured logging with context for debugging and observability
 *
 * Usage:
 * logger.info('User logged in', { userId: '123' })
 * logger.error('Payment failed', error, { bookingId: 'abc' })
 * logger.warn('Rate limit approaching', { remaining: 10 })
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

// Check if we're in development mode
const isDev = typeof process !== 'undefined' ? process.dev : import.meta.dev

// Log level priority for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Minimum log level (debug in dev, info in production)
const MIN_LOG_LEVEL: LogLevel = isDev ? 'debug' : 'info'

/**
 * Check if a log level should be output
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL]
}

/**
 * Format error for logging (strips sensitive data)
 */
function formatError(error: Error | unknown): LogEntry['error'] | undefined {
  if (!error) return undefined

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: isDev ? error.stack : undefined, // Only include stack in dev
    }
  }

  return {
    name: 'UnknownError',
    message: String(error),
  }
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error | unknown
): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error: formatError(error),
  }
}

/**
 * Output log to console with appropriate method and formatting
 */
function outputLog(entry: LogEntry): void {
  const prefix = `[${entry.level.toUpperCase()}]`
  const timestamp = isDev ? `[${entry.timestamp}]` : ''
  const formattedMessage = `${prefix}${timestamp} ${entry.message}`

  switch (entry.level) {
    case 'debug':
      if (entry.context || entry.error) {
        console.debug(formattedMessage, { context: entry.context, error: entry.error })
      } else {
        console.debug(formattedMessage)
      }
      break

    case 'info':
      if (entry.context) {
        console.info(formattedMessage, entry.context)
      } else {
        console.info(formattedMessage)
      }
      break

    case 'warn':
      if (entry.context) {
        console.warn(formattedMessage, entry.context)
      } else {
        console.warn(formattedMessage)
      }
      break

    case 'error':
      if (entry.error) {
        console.error(formattedMessage, entry.error, entry.context)
      } else {
        console.error(formattedMessage, entry.context)
      }
      break
  }
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  /**
   * Debug level - detailed information for development
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return
    const entry = createLogEntry('debug', message, context)
    outputLog(entry)
  },

  /**
   * Info level - general operational information
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return
    const entry = createLogEntry('info', message, context)
    outputLog(entry)
  },

  /**
   * Warn level - warning conditions that should be noted
   */
  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return
    const entry = createLogEntry('warn', message, context)
    outputLog(entry)
  },

  /**
   * Error level - error conditions with optional error object
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!shouldLog('error')) return
    const entry = createLogEntry('error', message, context, error)
    outputLog(entry)
  },

  /**
   * Create a child logger with preset context
   * Useful for adding module/component context to all logs
   */
  child(defaultContext: LogContext) {
    return {
      debug: (message: string, context?: LogContext) =>
        logger.debug(message, { ...defaultContext, ...context }),
      info: (message: string, context?: LogContext) =>
        logger.info(message, { ...defaultContext, ...context }),
      warn: (message: string, context?: LogContext) =>
        logger.warn(message, { ...defaultContext, ...context }),
      error: (message: string, error?: Error | unknown, context?: LogContext) =>
        logger.error(message, error, { ...defaultContext, ...context }),
    }
  },
}

// Export convenience loggers for common modules
export const offlineLogger = logger.child({ module: 'offline' })
export const apiLogger = logger.child({ module: 'api' })
export const authLogger = logger.child({ module: 'auth' })
export const bookingLogger = logger.child({ module: 'booking' })