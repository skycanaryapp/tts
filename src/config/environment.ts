// Environment configuration management
export interface AppConfig {
  appName: string;
  appVersion: string;
  apiBaseUrl: string;
  zokaWebhookUrl: string;
  geminiApiKey: string;
  environment: 'development' | 'production' | 'staging';
  debug: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export const config: AppConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'Mandaleen',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  zokaWebhookUrl: import.meta.env.VITE_ZOKA_WEBHOOK_URL || 'https://0zr8zljh.rpcld.cc/webhook/zoka',
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  environment: (import.meta.env.VITE_ENVIRONMENT as AppConfig['environment']) || 'development',
  debug: import.meta.env.VITE_DEBUG === 'true',
  logLevel: (import.meta.env.VITE_LOG_LEVEL as AppConfig['logLevel']) || 'debug',
};

export const isDevelopment = config.environment === 'development';
export const isProduction = config.environment === 'production';

// Validation function to ensure required environment variables are present
export const validateConfig = (): void => {
  const requiredVars = {
    VITE_APP_NAME: config.appName,
    VITE_API_BASE_URL: config.apiBaseUrl,
    VITE_ZOKA_WEBHOOK_URL: config.zokaWebhookUrl,
  };

  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (isProduction && !config.geminiApiKey) {
    console.warn('Warning: VITE_GEMINI_API_KEY is not set in production environment');
  }
};