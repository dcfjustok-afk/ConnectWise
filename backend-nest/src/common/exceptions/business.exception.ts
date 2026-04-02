import { HttpException, HttpStatus } from '@nestjs/common';
import { BizErrorCode } from './biz-error-code.enum';

export class BusinessException extends HttpException {
  public readonly bizCode: number;

  constructor(
    bizCode: BizErrorCode | number,
    message: string,
    httpStatus: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super(message, httpStatus);
    this.bizCode = bizCode;
  }

  /** 快捷工厂：未授权 */
  static unauthorized(message = '未登录或会话已过期'): BusinessException {
    return new BusinessException(
      BizErrorCode.UNAUTHORIZED,
      message,
      HttpStatus.UNAUTHORIZED,
    );
  }

  /** 快捷工厂：资源不存在 */
  static notFound(
    bizCode: BizErrorCode,
    message = '资源不存在',
  ): BusinessException {
    return new BusinessException(bizCode, message, HttpStatus.NOT_FOUND);
  }

  /** 快捷工厂：权限不足 */
  static forbidden(
    bizCode: BizErrorCode,
    message = '无权限访问',
  ): BusinessException {
    return new BusinessException(bizCode, message, HttpStatus.FORBIDDEN);
  }
}
