import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BizErrorCode, BusinessException } from '../common/exceptions';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async register(username: string, email: string, password: string) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      throw new BusinessException(BizErrorCode.USER_ALREADY_EXISTS, '用户名或邮箱已存在');
    }
    const user = await this.prisma.user.create({
      data: { username, email, password: this.hashPassword(password) },
    });
    return { id: user.id, username: user.username, email: user.email };
  }

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user || user.password !== this.hashPassword(password)) {
      throw new BusinessException(BizErrorCode.LOGIN_FAILED, '用户名或密码错误');
    }
    return { id: user.id, username: user.username, email: user.email };
  }
}
