import { Test, TestingModule } from '@nestjs/testing';
import { CanvasService } from './canvas.service';
import { CanvasRepository } from './canvas.repository';
import { BusinessException } from '../common/exceptions';
import { BizErrorCode } from '../common/exceptions';
import { MinioService } from '../minio/minio.service';

describe('CanvasService', () => {
  let service: CanvasService;
  let repo: {
    create: jest.Mock;
    findByOwner: jest.Mock;
    findById: jest.Mock;
    findSharePermission: jest.Mock;
    updateById: jest.Mock;
    deleteById: jest.Mock;
    findOwnedConnections: jest.Mock;
    findSharedConnections: jest.Mock;
  };

  const mockCanvas = {
    id: 1,
    userId: 10,
    title: 'Test Canvas',
    nodes: [],
    edges: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findByOwner: jest.fn(),
      findById: jest.fn(),
      findSharePermission: jest.fn(),
      updateById: jest.fn(),
      deleteById: jest.fn(),
      findOwnedConnections: jest.fn(),
      findSharedConnections: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanvasService,
        { provide: CanvasRepository, useValue: repo },
        { provide: MinioService, useValue: {} },
      ],
    }).compile();

    service = module.get<CanvasService>(CanvasService);
  });

  // ── Step 084: 创建 ──

  describe('createForUser', () => {
    it('应成功创建画布', async () => {
      repo.create.mockResolvedValue(mockCanvas);

      const result = await service.createForUser(10, 10, { title: 'Test Canvas' });
      expect(result).toEqual(mockCanvas);
      expect(repo.create).toHaveBeenCalledWith(10, 'Test Canvas', [], []);
    });

    it('路径 userId 与当前用户不一致时应拒绝', () => {
      expect(() => service.createForUser(99, 10, { title: 'Test' })).toThrow(BusinessException);

      try {
        service.createForUser(99, 10, { title: 'Test' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_ACCESS_DENIED);
      }
    });

    it('应正确传递 nodes 和 edges', async () => {
      const nodes = [{ id: 'n1' }];
      const edges = [{ id: 'e1' }];
      repo.create.mockResolvedValue({ ...mockCanvas, nodes, edges });

      await service.createForUser(10, 10, { title: 'Test', nodes, edges });
      expect(repo.create).toHaveBeenCalledWith(10, 'Test', nodes, edges);
    });
  });

  // ── Step 085: 读取 ──

  describe('findByUser', () => {
    it('应返回用户的画布列表', async () => {
      repo.findByOwner.mockResolvedValue([{ ...mockCanvas, user: { username: 'alice' } }]);

      const result = await service.findByUser(10, 10);
      expect(result).toEqual([{ ...mockCanvas, userName: 'alice' }]);
      expect(repo.findByOwner).toHaveBeenCalledWith(10);
    });

    it('路径 userId 与当前用户不一致时应拒绝', async () => {
      await expect(service.findByUser(99, 10)).rejects.toThrow(BusinessException);
    });
  });

  describe('findOne', () => {
    it('所有者应能读取', async () => {
      repo.findById.mockResolvedValue(mockCanvas);

      const result = await service.findOne(1, 10);
      expect(result).toEqual(mockCanvas);
    });

    it('画布不存在时应返回 3006', async () => {
      repo.findById.mockResolvedValue(null);

      try {
        await service.findOne(999, 10);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_NOT_FOUND);
      }
    });

    it('有分享权限的用户应能读取', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue('view');

      const result = await service.findOne(1, 20);
      expect(result).toEqual(mockCanvas);
    });

    it('无权限的用户应被拒绝 (3007)', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue(null);

      try {
        await service.findOne(1, 20);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_ACCESS_DENIED);
      }
    });
  });

  describe('getConnections', () => {
    it('应返回 owned 和 shared', async () => {
      repo.findOwnedConnections.mockResolvedValue([mockCanvas]);
      repo.findSharedConnections.mockResolvedValue([]);

      const result = await service.getConnections(10);
      expect(result).toEqual({ owned: [mockCanvas], shared: [] });
    });
  });

  // ── Step 086: 更新 ──

  describe('update', () => {
    it('所有者应能更新', async () => {
      const updated = { ...mockCanvas, title: 'Updated' };
      repo.findById.mockResolvedValue(mockCanvas);
      repo.updateById.mockResolvedValue(updated);

      const result = await service.update(10, { id: 1, title: 'Updated' });
      expect(result).toEqual(updated);
      expect(repo.updateById).toHaveBeenCalledWith(1, { title: 'Updated' });
    });

    it('有 edit 权限的分享者应能更新', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue('edit');
      repo.updateById.mockResolvedValue(mockCanvas);

      await service.update(20, { id: 1, title: 'Shared Edit' });
      expect(repo.updateById).toHaveBeenCalled();
    });

    it('仅 view 权限的分享者不能更新 (3007)', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue('view');

      try {
        await service.update(20, { id: 1, title: 'Nope' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_ACCESS_DENIED);
      }
    });

    it('画布不存在时应返回 3006', async () => {
      repo.findById.mockResolvedValue(null);

      try {
        await service.update(10, { id: 999, title: 'X' });
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_NOT_FOUND);
      }
    });

    it('仅更新 nodes 时只传 nodes', async () => {
      const newNodes = [{ id: 'n1', label: 'hello' }];
      repo.findById.mockResolvedValue(mockCanvas);
      repo.updateById.mockResolvedValue({ ...mockCanvas, nodes: newNodes });

      await service.update(10, { id: 1, nodes: newNodes });
      expect(repo.updateById).toHaveBeenCalledWith(1, { nodes: newNodes });
    });
  });

  // ── Step 087: 删除 ──

  describe('remove', () => {
    it('所有者应能删除', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.deleteById.mockResolvedValue(mockCanvas);

      const result = await service.remove(1, 10);
      expect(result).toEqual({ success: true });
      expect(repo.deleteById).toHaveBeenCalledWith(1);
    });

    it('画布不存在时应返回 3006', async () => {
      repo.findById.mockResolvedValue(null);

      try {
        await service.remove(999, 10);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_NOT_FOUND);
      }
    });

    it('非所有者不能删除 (3007)', async () => {
      repo.findById.mockResolvedValue(mockCanvas);

      try {
        await service.remove(1, 20);
      } catch (e) {
        expect((e as BusinessException).bizCode).toBe(BizErrorCode.CANVAS_ACCESS_DENIED);
      }
    });
  });

  // ── Step 088: 权限边界 ──

  describe('权限边界', () => {
    it('无分享记录的用户不能 findOne', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue(null);

      await expect(service.findOne(1, 30)).rejects.toThrow(BusinessException);
    });

    it('view 权限的用户可以 findOne 但不能 update', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue('view');

      // findOne 允许
      const result = await service.findOne(1, 30);
      expect(result).toEqual(mockCanvas);

      // update 拒绝
      await expect(
        service.update(30, { id: 1, title: 'No' }),
      ).rejects.toThrow(BusinessException);
    });

    it('edit 权限的用户可以 findOne 和 update，但不能 remove', async () => {
      repo.findById.mockResolvedValue(mockCanvas);
      repo.findSharePermission.mockResolvedValue('edit');
      repo.updateById.mockResolvedValue(mockCanvas);

      // findOne 允许
      await service.findOne(1, 30);
      // update 允许
      await service.update(30, { id: 1, title: 'Shared' });

      // remove 拒绝（非所有者）
      await expect(service.remove(1, 30)).rejects.toThrow(BusinessException);
    });

    it('ensurePathUser 严格匹配', async () => {
      // createForUser: pathUserId !== currentUserId → 拒绝
      expect(() => service.createForUser(1, 2, { title: 'X' })).toThrow(BusinessException);
      // findByUser: pathUserId !== currentUserId → 拒绝
      await expect(service.findByUser(1, 2)).rejects.toThrow(BusinessException);
    });
  });
});
