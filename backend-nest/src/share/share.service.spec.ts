import { Test, TestingModule } from '@nestjs/testing';
import { ShareService } from './share.service';
import { ShareRepository } from './share.repository';
import { BusinessException } from '../common/exceptions';
import { BizErrorCode } from '../common/exceptions';

describe('ShareService', () => {
  let service: ShareService;
  let repo: {
    findByUserId: jest.Mock;
    findByCanvasId: jest.Mock;
    findById: jest.Mock;
    findByCanvasAndUser: jest.Mock;
    create: jest.Mock;
    updateById: jest.Mock;
    deleteById: jest.Mock;
    findCanvasOwner: jest.Mock;
    findUserByUsername: jest.Mock;
  };

  const mockShare = {
    id: 1,
    canvasId: 10,
    userId: 20,
    permission: 'view',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      findByUserId: jest.fn(),
      findByCanvasId: jest.fn(),
      findById: jest.fn(),
      findByCanvasAndUser: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findCanvasOwner: jest.fn(),
      findUserByUsername: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareService,
        { provide: ShareRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<ShareService>(ShareService);
  });

  // ── Step 097: owner 限制 ──

  describe('findByUser', () => {
    it('本人可查看自己的分享列表', () => {
      repo.findByUserId.mockResolvedValue([mockShare]);
      expect(service.findByUser(20, 20)).resolves.toEqual([mockShare]);
    });

    it('非本人查看他人分享列表应拒绝 (4003)', () => {
      expect(() => service.findByUser(20, 99)).toThrow(BusinessException);
      try {
        service.findByUser(20, 99);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });
  });

  describe('findByCanvas', () => {
    it('画布所有者可查看分享列表', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findByCanvasId.mockResolvedValue([mockShare]);

      const result = await service.findByCanvas(10, 1);
      expect(result).toEqual([mockShare]);
    });

    it('非画布所有者查看分享列表应拒绝 (4003)', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });

      try {
        await service.findByCanvas(10, 99);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });

    it('画布不存在应返回 3006', async () => {
      repo.findCanvasOwner.mockResolvedValue(null);

      try {
        await service.findByCanvas(999, 1);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_NOT_FOUND);
      }
    });
  });

  describe('create — owner 限制', () => {
    it('仅画布所有者可创建分享', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findUserByUsername.mockResolvedValue({ id: 20, username: 'bob' });
      repo.findByCanvasAndUser.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockShare);

      const result = await service.create(1, { canvasId: 10, toUsername: 'bob', permission: 'view' });
      expect(result).toEqual(mockShare);
    });

    it('非所有者创建分享应拒绝 (4003)', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });

      try {
        await service.create(99, { canvasId: 10, toUsername: 'bob', permission: 'view' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });

    it('画布不存在应返回 3006', async () => {
      repo.findCanvasOwner.mockResolvedValue(null);

      try {
        await service.create(1, { canvasId: 999, toUsername: 'bob', permission: 'view' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_NOT_FOUND);
      }
    });

    it('目标用户不存在应返回 4005', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findUserByUsername.mockResolvedValue(null);

      try {
        await service.create(1, { canvasId: 10, toUsername: 'ghost', permission: 'view' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_NOT_FOUND);
      }
    });

    it('不能分享给自己 (4003)', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findUserByUsername.mockResolvedValue({ id: 1, username: 'self' });

      try {
        await service.create(1, { canvasId: 10, toUsername: 'self', permission: 'view' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });
  });

  // ── Step 098: 重复分享 ──

  describe('create — 重复分享', () => {
    it('重复分享同一用户应返回 4004', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findUserByUsername.mockResolvedValue({ id: 20, username: 'bob' });
      repo.findByCanvasAndUser.mockResolvedValue(mockShare);

      try {
        await service.create(1, { canvasId: 10, toUsername: 'bob', permission: 'view' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_DUPLICATE);
      }
    });

    it('同一画布分享给不同用户应成功', async () => {
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.findUserByUsername.mockResolvedValue({ id: 30, username: 'charlie' });
      repo.findByCanvasAndUser.mockResolvedValue(null);
      repo.create.mockResolvedValue({ ...mockShare, userId: 30, id: 2 });

      const result = await service.create(1, { canvasId: 10, toUsername: 'charlie', permission: 'edit' });
      expect(result.userId).toBe(30);
    });
  });

  describe('update — owner 限制', () => {
    it('画布所有者可修改权限', async () => {
      repo.findById.mockResolvedValue(mockShare);
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.updateById.mockResolvedValue({ ...mockShare, permission: 'edit' });

      const result = await service.update(1, { id: 1, permission: 'edit' });
      expect(result.permission).toBe('edit');
    });

    it('非所有者修改权限应拒绝 (4003)', async () => {
      repo.findById.mockResolvedValue(mockShare);
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });

      try {
        await service.update(99, { id: 1, permission: 'edit' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });

    it('分享记录不存在应返回 4005', async () => {
      repo.findById.mockResolvedValue(null);

      try {
        await service.update(1, { id: 999, permission: 'edit' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_NOT_FOUND);
      }
    });
  });

  describe('remove', () => {
    it('画布所有者可删除分享', async () => {
      repo.findById.mockResolvedValue(mockShare);
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.deleteById.mockResolvedValue(mockShare);

      const result = await service.remove(1, 1);
      expect(result).toEqual({ success: true });
    });

    it('被分享者自身可删除分享', async () => {
      repo.findById.mockResolvedValue(mockShare);
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });
      repo.deleteById.mockResolvedValue(mockShare);

      const result = await service.remove(1, 20);
      expect(result).toEqual({ success: true });
    });

    it('第三方不能删除分享 (4003)', async () => {
      repo.findById.mockResolvedValue(mockShare);
      repo.findCanvasOwner.mockResolvedValue({ id: 10, userId: 1 });

      try {
        await service.remove(1, 99);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_PERMISSION_DENIED);
      }
    });

    it('分享不存在应返回 4005', async () => {
      repo.findById.mockResolvedValue(null);

      try {
        await service.remove(999, 1);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.SHARE_NOT_FOUND);
      }
    });
  });
});
