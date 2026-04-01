import { CookieOptions } from 'express-session';

type SessionConfig = {
  redisUrl: string;
  redisPrefix: string;
  secret: string;
  cookieName: string;
  cookie: CookieOptions;
};

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }
  return value.toLowerCase() === 'true';
}

function toNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function toSameSite(value: string | undefined): CookieOptions['sameSite'] {
  if (value === 'strict' || value === 'none' || value === 'lax') {
    return value;
  }
  return 'lax';
}

export function getSessionConfig(): SessionConfig {
  return {
    redisUrl: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    redisPrefix: process.env.SESSION_PREFIX ?? 'connectionwise:sess:',
    secret: process.env.SESSION_SECRET ?? 'change-this-session-secret',
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'JSESSIONID',
    cookie: {
      httpOnly: toBoolean(process.env.SESSION_COOKIE_HTTP_ONLY, true),
      secure: toBoolean(process.env.SESSION_COOKIE_SECURE, false),
      sameSite: toSameSite(process.env.SESSION_COOKIE_SAME_SITE),
      maxAge: toNumber(process.env.SESSION_COOKIE_MAX_AGE_MS, 604800000),
    },
  };
}
