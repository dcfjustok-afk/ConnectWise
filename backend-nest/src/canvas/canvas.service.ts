import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BizErrorCode, BusinessException } from '../common/exceptions';
import { canRead, canWrite } from '../common/policy/canvas-permission.policy';
import { MinioService } from '../minio/minio.service';
import { CanvasRepository } from './canvas.repository';
import { CreateCanvasDto } from './dto/create-canvas.dto';
import { UpdateCanvasDto } from './dto/update-canvas.dto';

@Injectable()
export class CanvasService {
  constructor(
    private readonly canvasRepository: CanvasRepository,
    private readonly minioService: MinioService,
  ) {}

  createForUser(pathUserId: number, currentUserId: number, dto: CreateCanvasDto) {
    this.ensurePathUser(pathUserId, currentUserId);
    return this.canvasRepository.create(
      pathUserId,
      dto.title,
      (dto.nodes ?? []) as Prisma.InputJsonValue,
      (dto.edges ?? []) as Prisma.InputJsonValue,
    );
  }

  async findByUser(pathUserId: number, currentUserId: number) {
    this.ensurePathUser(pathUserId, currentUserId);
    const canvases = await this.canvasRepository.findByOwner(pathUserId);
    return canvases.map(({ user, ...rest }) => ({
      ...rest,
      userName: user?.username ?? null,
    }));
  }

  async findOne(canvasId: number, currentUserId: number) {
    const canvas = await this.canvasRepository.findById(canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId === currentUserId) {
      return canvas;
    }

    const permission = await this.canvasRepository.findSharePermission(canvasId, currentUserId);
    if (!canRead(permission)) {
      throw BusinessException.forbidden(BizErrorCode.CANVAS_ACCESS_DENIED, '无权访问该画布');
    }
    return canvas;
  }

  async update(currentUserId: number, dto: UpdateCanvasDto) {
    const canvas = await this.canvasRepository.findById(dto.id);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }

    if (canvas.userId !== currentUserId) {
      const permission = await this.canvasRepository.findSharePermission(dto.id, currentUserId);
      if (!canWrite(permission)) {
        throw BusinessException.forbidden(BizErrorCode.CANVAS_ACCESS_DENIED, '无权编辑该画布');
      }
    }

    const data: Prisma.CanvasUpdateInput = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.nodes !== undefined) data.nodes = dto.nodes as Prisma.InputJsonValue;
    if (dto.edges !== undefined) data.edges = dto.edges as Prisma.InputJsonValue;

    return this.canvasRepository.updateById(dto.id, data);
  }

  async remove(canvasId: number, currentUserId: number) {
    const canvas = await this.canvasRepository.findById(canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.CANVAS_ACCESS_DENIED, '仅所有者可删除画布');
    }
    await this.canvasRepository.deleteById(canvasId);
    return { success: true };
  }

  async getConnections(currentUserId: number) {
    const [owned, shared] = await Promise.all([
      this.canvasRepository.findOwnedConnections(currentUserId),
      this.canvasRepository.findSharedConnections(currentUserId),
    ]);

    return {
      owned,
      shared,
    };
  }

  private ensurePathUser(pathUserId: number, currentUserId: number): void {
    if (pathUserId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.CANVAS_ACCESS_DENIED, '仅可访问自己的画布列表');
    }
  }

  async uploadThumbnail(canvasId: number, currentUserId: number, file: Express.Multer.File) {
    if (!file) {
      throw new BusinessException(BizErrorCode.BAD_REQUEST, '缺少文件');
    }
    const canvas = await this.canvasRepository.findById(canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId !== currentUserId) {
      const perm = await this.canvasRepository.findSharePermission(canvasId, currentUserId);
      if (!canWrite(perm)) {
        throw BusinessException.forbidden(BizErrorCode.CANVAS_ACCESS_DENIED, '无权上传缩略图');
      }
    }

    const ext = file.originalname.split('.').pop() ?? 'png';
    const objectName = `thumbnails/${canvasId}_${Date.now()}.${ext}`;

    // 删除旧缩略图
    if (canvas.thumbnailFileName) {
      try { await this.minioService.removeObject(canvas.thumbnailFileName); } catch { /* ignore */ }
    }

    await this.minioService.putObject(objectName, file.buffer, file.size, file.mimetype);
    await this.canvasRepository.updateById(canvasId, { thumbnailFileName: objectName });

    return { thumbnailFileName: objectName };
  }
}
