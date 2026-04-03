import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  provider: process.env.AI_PROVIDER ?? 'openai',
  baseUrl: process.env.AI_BASE_URL,
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL ?? 'gpt-4.1-mini',
  timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
  maxRetries: Number(process.env.AI_MAX_RETRIES ?? 2),
  maxRequestsPerMinute: Number(process.env.AI_MAX_RPM ?? 60),
}));
