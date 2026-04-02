import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CanvasRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    userId: number,
    title: string,
    nodes: Prisma.InputJsonValue,
    edges: Prisma.InputJsonValue,
  ) {
    return this.prisma.canvas.create({
      data: {
        userId,
        title,
        nodes,
        edges,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        nodes: true,
        edges: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByOwner(userId: number) {
    return this.prisma.canvas.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        userId: true,
        title: true,
        nodes: true,
        edges: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findById(id: number) {
    return this.prisma.canvas.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        title: true,
        nodes: true,
        edges: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findSharePermission(canvasId: number, userId: number): Promise<string | null> {
    const share = await this.prisma.canvasShare.findUnique({
      where: {
        canvasId_userId: {
          canvasId,
          userId,
        },
      },
      select: { permission: true },
    });
    return share?.permission ?? null;
  }

  updateById(id: number, data: Prisma.CanvasUpdateInput) {
    return this.prisma.canvas.update({
      where: { id },
      data,
      select: {
        id: true,
        userId: true,
        title: true,
        nodes: true,
        edges: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  deleteById(id: number) {
    return this.prisma.canvas.delete({ where: { id } });
  }

  findOwnedConnections(userId: number) {
    return this.prisma.canvas.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        userId: true,
        updatedAt: true,
        shares: {
          select: {
            userId: true,
            permission: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  findSharedConnections(userId: number) {
    return this.prisma.canvasShare.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        permission: true,
        canvas: {
          select: {
            id: true,
            title: true,
            userId: true,
            updatedAt: true,
            user: {
              select: {
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }
}
