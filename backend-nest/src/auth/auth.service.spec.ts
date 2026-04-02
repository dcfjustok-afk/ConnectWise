import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/exceptions';
import { BizErrorCode } from '../common/exceptions';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user and return profile', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        username: 'alice',
        email: 'alice@test.com',
        password: 'hashed',
      });

      const result = await service.register('alice', 'alice@test.com', 'password123');
      expect(result).toEqual({ id: 1, username: 'alice', email: 'alice@test.com' });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw USER_ALREADY_EXISTS if duplicate', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: 1 });
      await expect(service.register('alice', 'alice@test.com', 'pw')).rejects.toThrow(
        BusinessException,
      );
      try {
        await service.register('alice', 'alice@test.com', 'pw');
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.USER_ALREADY_EXISTS);
      }
    });
  });

  describe('login', () => {
    it('should return user on valid credentials', async () => {
      // Pre-compute sha256 of 'password123'
      const crypto = require('crypto');
      const hashed = crypto.createHash('sha256').update('password123').digest('hex');

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'alice',
        email: 'alice@test.com',
        password: hashed,
      });

      const result = await service.login('alice', 'password123');
      expect(result).toEqual({ id: 1, username: 'alice', email: 'alice@test.com' });
    });

    it('should throw LOGIN_FAILED on wrong password', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: 'alice',
        password: 'wrong-hash',
      });

      await expect(service.login('alice', 'password123')).rejects.toThrow(BusinessException);
    });

    it('should throw LOGIN_FAILED when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.login('nobody', 'pw')).rejects.toThrow(BusinessException);
    });
  });
});
