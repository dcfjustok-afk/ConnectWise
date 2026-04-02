import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessException } from '../common/exceptions';

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('search', () => {
    it('should return empty array for empty keyword', async () => {
      expect(await service.search('')).toEqual([]);
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should return matching users', async () => {
      const users = [{ id: 1, username: 'alice', email: 'alice@test.com' }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = await service.search('ali');
      expect(result).toEqual(users);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ username: { contains: 'ali', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      const user = { id: 1, username: 'alice', email: 'alice@test.com' };
      prisma.user.findUnique.mockResolvedValue(user);

      expect(await service.findById(1)).toEqual(user);
    });

    it('should throw USER_NOT_FOUND when missing', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow(BusinessException);
    });
  });
});
