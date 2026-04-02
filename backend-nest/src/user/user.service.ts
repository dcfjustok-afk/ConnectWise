import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BizErrorCode, BusinessException } from '../common/exceptions';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async search(keyword: string) {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: keyword, mode: 'insensitive' } },
          { email: { contains: keyword, mode: 'insensitive' } },
        ],
      },
      select: { id: true, username: true, email: true },
      take: 20,
    });
    return users;
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true, email: true },
    });
    if (!user) {
      throw BusinessException.notFound(BizErrorCode.USER_NOT_FOUND, '用户不存在');
    }
    return user;
  }
}
