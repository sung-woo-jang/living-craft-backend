import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync } from 'fs';
import { FileUtil } from '@common/utils/file.util';
import { ERROR_MESSAGES } from '@common/constants';
import { NcpStorageService } from '@common/services/ncp-storage.service';
import sharp from 'sharp';

@Injectable()
export class FilesService {
  private readonly uploadPath: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ncpStorageService: NcpStorageService,
  ) {
    this.uploadPath = this.configService.get<string>(
      'app.uploadPath',
      './uploads',
    );
    // NCP Object Storage 사용으로 로컬 디렉토리 생성 불필요
    // this.ensureUploadDirectories();
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
   * 이미지 업로드 및 리사이징 (NCP Object Storage)
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

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const s3Key = `${subfolder}/${filename}`;

    // Sharp를 사용한 이미지 리사이징 및 최적화
    try {
      const processedBuffer = await sharp(file.buffer)
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      // NCP Object Storage에 업로드
      const url = await this.ncpStorageService.uploadFile(
        processedBuffer,
        s3Key,
        'image/jpeg',
      );

      return {
        filename,
        path: s3Key,
        url,
      };
    } catch (error) {
      console.error('이미지 처리 실패:', error);
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.IMAGE_PROCESSING_ERROR,
      );
    }
  }

  /**
   * 파일 삭제 (NCP Object Storage)
   */
  async deleteFile(s3Key: string): Promise<void> {
    await this.ncpStorageService.deleteFile(s3Key);
  }

  /**
   * 파일 URL에서 S3 Key 추출
   * NCP URL: https://kr.object.ncloudstorage.com/living-craft/images/filename.jpg
   * -> S3 Key: images/filename.jpg
   */
  getFilePathFromUrl(url: string): string {
    const bucketName = this.configService.get<string>('app.ncp.bucketName');

    // 로컬 URL 형식인 경우 (하위 호환성)
    if (url.startsWith('/uploads/')) {
      return url.replace('/uploads/', '');
    }

    // NCP URL에서 S3 Key 추출
    try {
      const urlObj = new URL(url);
      const pathWithBucket = urlObj.pathname.substring(1); // 맨 앞 '/' 제거
      return pathWithBucket.replace(`${bucketName}/`, '');
    } catch (error) {
      console.error('URL 파싱 실패:', error);
      // URL 파싱 실패 시 그대로 반환
      return url;
    }
  }

  /**
   * 파일 존재 여부 확인
   */
  fileExists(filepath: string): boolean {
    return existsSync(filepath);
  }

  /**
   * 문서 파일 업로드 (NCP Object Storage, 리사이징 없이 원본 그대로 저장)
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

    const filename = FileUtil.generateUniqueFilename(file.originalname);
    const s3Key = `documents/${filename}`;

    try {
      // 문서 파일은 리사이징 없이 원본 그대로 NCP에 업로드
      const url = await this.ncpStorageService.uploadFile(
        file.buffer,
        s3Key,
        file.mimetype,
      );

      return {
        filename,
        path: s3Key,
        url,
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
}
