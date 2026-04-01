import 'express-session';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: string | number | bigint;
      username?: string;
      email?: string;
    };
  }
}
