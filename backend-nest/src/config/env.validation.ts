import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

  DATABASE_URL: Joi.string().uri({ scheme: ['postgres', 'postgresql'] }).required(),
  DB_SCHEMA: Joi.string().default('public'),
  DB_POOL_MIN: Joi.number().min(0).default(2),
  DB_POOL_MAX: Joi.number().min(1).default(20),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_DB: Joi.number().min(0).default(0),
  REDIS_PASSWORD: Joi.string().allow('').optional(),

  SESSION_NAME: Joi.string().default('connectwise.sid'),
  SESSION_SECRET: Joi.string().min(16).required(),
  SESSION_TTL_SECONDS: Joi.number().min(60).default(604800),
  SESSION_COOKIE_SECURE: Joi.boolean().truthy('true').falsy('false').default(false),
  SESSION_COOKIE_HTTP_ONLY: Joi.boolean().truthy('true').falsy('false').default(true),
  SESSION_COOKIE_SAME_SITE: Joi.string().valid('strict', 'lax', 'none').default('lax'),

  MINIO_ENDPOINT: Joi.string().uri().required(),
  MINIO_REGION: Joi.string().default('us-east-1'),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().default('connectionwise'),
  MINIO_USE_SSL: Joi.boolean().truthy('true').falsy('false').default(false),

  AI_PROVIDER: Joi.string().required(),
  AI_BASE_URL: Joi.string().uri().required(),
  AI_API_KEY: Joi.string().allow('').optional(),
  AI_MODEL: Joi.string().required(),
  AI_TIMEOUT_MS: Joi.number().min(1000).default(30000),
  AI_MAX_RETRIES: Joi.number().min(0).default(2),
});
