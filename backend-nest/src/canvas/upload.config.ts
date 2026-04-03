import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

/** 允许的缩略图 MIME 类型 */
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);

/** 最大文件大小 5 MB */
export const THUMBNAIL_MAX_SIZE = 5 * 1024 * 1024;

export const thumbnailMulterOptions = {
  storage: memoryStorage(),
  limits: { fileSize: THUMBNAIL_MAX_SIZE },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new BadRequestException(`不支持的文件类型: ${file.mimetype}，仅允许 png/jpeg/webp`),
        false,
      );
    }
    cb(null, true);
  },
};
