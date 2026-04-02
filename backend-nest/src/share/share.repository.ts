import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShareRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: number) {
    return this.prisma.canvasShare.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        canvasId: true,
        userId: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
        canvas: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: { select: { username: true, email: true } },
          },
        },
      },
    });
  }

  findByCanvasId(canvasId: number) {
    return this.prisma.canvasShare.findMany({
      where: { canvasId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        canvasId: true,
        userId: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, username: true, email: true } },
      },
    });
  }

  findById(id: number) {
    return this.prisma.canvasShare.findUnique({
      where: { id },
      select: {
        id: true,
        canvasId: true,
        userId: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByCanvasAndUser(canvasId: number, userId: number) {
    return this.prisma.canvasShare.findUnique({
      where: { canvasId_userId: { canvasId, userId } },
    });
  }

  create(canvasId: number, userId: number, permission: string) {
    return this.prisma.canvasShare.create({
      data: { canvasId, userId, permission },
      select: {
        id: true,
        canvasId: true,
        userId: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateById(id: number, permission: string) {
    return this.prisma.canvasShare.update({
      where: { id },
      data: { permission },
      select: {
        id: true,
        canvasId: true,
        userId: true,
        permission: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  deleteById(id: number) {
    return this.prisma.canvasShare.delete({ where: { id } });
  }

  findCanvasOwner(canvasId: number) {
    return this.prisma.canvas.findUnique({
      where: { id: canvasId },
      select: { id: true, userId: true },
    });
  }

  findUserByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true },
    });
  }
}
