import { registerAs } from '@nestjs/config';

export default registerAs('session', () => ({
  name: process.env.SESSION_NAME ?? 'connectwise.sid',
  secret: process.env.SESSION_SECRET,
  ttlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 60 * 60 * 24 * 7),
  cookie: {
    secure: String(process.env.SESSION_COOKIE_SECURE ?? 'false') === 'true',
    httpOnly: String(process.env.SESSION_COOKIE_HTTP_ONLY ?? 'true') === 'true',
    sameSite: process.env.SESSION_COOKIE_SAME_SITE ?? 'lax',
  },
}));
