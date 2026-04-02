import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { BusinessException } from '../../common/exceptions';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AuthGuard(reflector);
  });

  function createMockContext(sessionData: Record<string, unknown>, isPublic = false): ExecutionContext {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);
    return {
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ session: sessionData }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow public routes', () => {
    const ctx = createMockContext({}, true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should allow authenticated requests', () => {
    const ctx = createMockContext({ userId: 1, username: 'alice' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw BusinessException.unauthorized for unauthenticated', () => {
    const ctx = createMockContext({});
    expect(() => guard.canActivate(ctx)).toThrow(BusinessException);
  });

  it('should throw when session.userId is undefined', () => {
    const ctx = createMockContext({ userId: undefined });
    expect(() => guard.canActivate(ctx)).toThrow(BusinessException);
  });
});
