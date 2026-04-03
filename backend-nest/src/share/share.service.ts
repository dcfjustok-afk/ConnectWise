import { Injectable } from '@nestjs/common';
import { BizErrorCode, BusinessException } from '../common/exceptions';
import { ShareRepository } from './share.repository';
import { CreateShareDto } from './dto/create-share.dto';
import { UpdateShareDto } from './dto/update-share.dto';

@Injectable()
export class ShareService {
  constructor(private readonly shareRepository: ShareRepository) {}

  findByUser(userId: number, currentUserId: number) {
    if (userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.SHARE_PERMISSION_DENIED, '仅可查看自己的分享列表');
    }
    return this.shareRepository.findByUserId(userId);
  }

  async findByCanvas(canvasId: number, currentUserId: number) {
    const canvas = await this.shareRepository.findCanvasOwner(canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.SHARE_PERMISSION_DENIED, '仅画布所有者可查看分享列表');
    }
    return this.shareRepository.findByCanvasId(canvasId);
  }

  async create(currentUserId: number, dto: CreateShareDto) {
    // 校验画布存在且当前用户是所有者
    const canvas = await this.shareRepository.findCanvasOwner(dto.canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.SHARE_PERMISSION_DENIED, '仅画布所有者可创建分享');
    }

    // 兼容旧字段 userName 和新字段 toUsername
    const targetUsername = dto.toUsername ?? dto.userName ?? '';
    if (!targetUsername) {
      throw new BusinessException(BizErrorCode.BAD_REQUEST, '目标用户名不能为空');
    }

    // 校验目标用户存在
    const targetUser = await this.shareRepository.findUserByUsername(targetUsername);
    if (!targetUser) {
      throw new BusinessException(BizErrorCode.SHARE_NOT_FOUND, '分享目标用户不存在');
    }

    // 不能分享给自己
    if (targetUser.id === currentUserId) {
      throw new BusinessException(BizErrorCode.SHARE_PERMISSION_DENIED, '不能分享给自己');
    }

    // 校验重复分享
    const existing = await this.shareRepository.findByCanvasAndUser(dto.canvasId, targetUser.id);
    if (existing) {
      throw new BusinessException(BizErrorCode.SHARE_DUPLICATE, '该用户已被分享过此画布');
    }

    return this.shareRepository.create(dto.canvasId, targetUser.id, dto.permission);
  }

  async update(currentUserId: number, dto: UpdateShareDto) {
    let share: { id: number; canvasId: number; userId: number; permission: string } | null = null;

    if (dto.id) {
      // 新模式：通过 share 主键 ID 查找
      share = await this.shareRepository.findById(dto.id);
    } else if (dto.userId && dto.canvasId) {
      // 兼容旧前端：通过 userId + canvasId 复合键查找
      share = await this.shareRepository.findByCanvasAndUser(dto.canvasId, dto.userId);
    }

    if (!share) {
      throw BusinessException.notFound(BizErrorCode.SHARE_NOT_FOUND, '分享记录不存在');
    }

    // 仅画布所有者可修改
    const canvas = await this.shareRepository.findCanvasOwner(share.canvasId);
    if (!canvas || canvas.userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.SHARE_PERMISSION_DENIED, '仅画布所有者可修改分享权限');
    }

    return this.shareRepository.updateById(share.id, dto.permission);
  }

  async remove(shareId: number, currentUserId: number) {
    const share = await this.shareRepository.findById(shareId);
    if (!share) {
      throw BusinessException.notFound(BizErrorCode.SHARE_NOT_FOUND, '分享记录不存在');
    }

    // 画布所有者或被分享者自身可删除
    const canvas = await this.shareRepository.findCanvasOwner(share.canvasId);
    if (!canvas) {
      throw BusinessException.notFound(BizErrorCode.CANVAS_NOT_FOUND, '画布不存在');
    }
    if (canvas.userId !== currentUserId && share.userId !== currentUserId) {
      throw BusinessException.forbidden(BizErrorCode.SHARE_PERMISSION_DENIED, '无权删除此分享');
    }

    await this.shareRepository.deleteById(shareId);
    return { success: true };
  }
}
