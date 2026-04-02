import { Controller, Post, Body, Req, HttpCode } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('user')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const user = await this.authService.register(dto.username, dto.email, dto.password);
    await this.regenerateSession(req);
    req.session.userId = user.id;
    req.session.username = user.username;
    return user;
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const user = await this.authService.login(dto.username, dto.password);
    await this.regenerateSession(req);
    req.session.userId = user.id;
    req.session.username = user.username;
    return user;
  }

  /** 防止 session fixation 攻击：登录/注册后 regenerate session ID */
  private regenerateSession(req: Request): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Req() req: Request): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  @Public()
  @Post('check-auth')
  @HttpCode(200)
  checkAuth(@Req() req: Request) {
    if (!req.session.userId) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      userId: req.session.userId,
      username: req.session.username,
    };
  }
}
