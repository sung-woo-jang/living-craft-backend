import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { FileUtil } from '@common/utils/file.util';
import { ERROR_MESSAGES } from '@common/constants';
import sharp from 'sharp';

@Injectable()
export class FilesService {
  private readonly uploadPath: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadPath = this.configService.get<string>(
      'app.uploadPath',
      './uploads',
    );
    this.ensureUploadDirectories();
  }

  /**
   * Multer 설정 반환
   */
  getMulterOptions(subfolder = 'general'): MulterOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = join(this.uploadPath, subfolder);
          FileUtil.ensureDirectoryExists(uploadDir);
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueName = FileUtil.generateUniqueFilename(file.originalname);
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.webp',
          '.pdf',
          '.doc',
          '.docx',
        ];

        if (FileUtil.isAllowedFileType(file.originalname, allowedTypes)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(ERROR_MESSAGES.FILES.UNSUPPORTED_TYPE),
            false,
          );
        }
      },
      limits: {
        fileSize: this.configService.get<number>(
          'app.maxFileSize',
          10 * 1024 * 1024,
        ), // 10MB
      },
    };
  }

  /**
   * 이미지 업로드 및 리사이징
   */
  async uploadImage(
    file: Express.Multer.File,
    subfolder = 'images',
    maxWidth = 1200,
    quality = 80,
  ): Promise<{ filename: string; path: string; url: string }> {
    if (!FileUtil.isImageFile(file.originalname)) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.IMAGE_ONLY);
    }

    const uploadDir = join(this.uploadPath, subfolder);
    FileUtil.ensureDirectoryExists(uploadDir);

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const filepath = join(uploadDir, filename);

    // Sharp를 사용한 이미지 리사이징 및 최적화
    try {
      await sharp(file.buffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality, progressive: true })
        .png({ quality, progressive: true })
        .webp({ quality })
        .toFile(filepath);

      return {
        filename,
        path: filepath,
        url: `/uploads/${subfolder}/${filename}`,
      };
    } catch {
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.IMAGE_PROCESSING_ERROR,
      );
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(filepath: string): Promise<void> {
    try {
      if (existsSync(filepath)) {
        unlinkSync(filepath);
      }
    } catch (error) {
      // 파일 삭제 실패는 로그만 남기고 에러를 던지지 않음
      console.error('파일 삭제 실패:', error);
    }
  }

  /**
   * 파일 URL을 실제 파일 경로로 변환
   */
  getFilePathFromUrl(url: string): string {
    // /uploads/images/filename.jpg -> ./uploads/images/filename.jpg
    const relativePath = url.replace('/uploads/', '');
    return join(this.uploadPath, relativePath);
  }

  /**
   * 파일 존재 여부 확인
   */
  fileExists(filepath: string): boolean {
    return existsSync(filepath);
  }

  /**
   * 업로드 디렉토리 생성
   */
  private ensureUploadDirectories(): void {
    const directories = [
      'images',
      'services',
      'portfolio',
      'reviews',
      'documents',
      'temp',
    ];

    directories.forEach((dir) => {
      const dirPath = join(this.uploadPath, dir);
      FileUtil.ensureDirectoryExists(dirPath);
    });
  }

  /**
   * 문서 파일 업로드 (리사이징 없이 원본 그대로 저장)
   */
  async uploadDocument(
    file: Express.Multer.File,
  ): Promise<{ filename: string; path: string; url: string }> {
    const allowedDocTypes = ['.pdf', '.doc', '.docx', '.hwp', '.txt'];
    const extension = FileUtil.getExtension(file.originalname);

    if (!allowedDocTypes.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.UNSUPPORTED_DOCUMENT_TYPE,
      );
    }

    const uploadDir = join(this.uploadPath, 'documents');
    FileUtil.ensureDirectoryExists(uploadDir);

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const filepath = join(uploadDir, filename);

    try {
      // 문서 파일은 리사이징 없이 원본 그대로 저장
      writeFileSync(filepath, file.buffer);

      return {
        filename,
        path: filepath,
        url: `/uploads/documents/${filename}`,
      };
    } catch (error) {
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.DOCUMENT_SAVE_ERROR(error.message),
      );
    }
  }

  /**
   * 파일 정보 반환
   */
  getFileInfo(file: Express.Multer.File): {
    originalName: string;
    size: string;
    mimeType: string;
    extension: string;
  } {
    return {
      originalName: file.originalname,
      size: FileUtil.formatFileSize(file.size),
      mimeType: file.mimetype,
      extension: FileUtil.getExtension(file.originalname),
    };
  }

  /**
   * 임시 파일 정리 (스케줄러에서 사용)
   */
  async cleanupTempFiles(): Promise<void> {
    const tempDir = join(this.uploadPath, 'temp');
    console.log('Cleaning up temp files in:', tempDir);
    // 실제 구현에서는 fs.readdir과 stat을 사용하여 파일 생성일 확인 후 삭제
  }
}
