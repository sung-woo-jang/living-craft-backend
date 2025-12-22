import {
  BadRequestException,
  Controller,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';
import { FileUtil } from '@common/utils/file.util';
import { ERROR_MESSAGES } from '@common/constants';

@ApiTags('파일')
@Controller('files')
@SwaggerBaseApply()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload/image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '이미지 업로드',
    description: '이미지 파일을 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '이미지 업로드 성공',
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    const result = await this.filesService.uploadImage(file, 'images');
    return new SuccessBaseResponseDto('이미지를 업로드했습니다.', result);
  }

  @Post('upload/service-image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '서비스 이미지 업로드',
    description: '서비스용 이미지 파일을 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '서비스 이미지 업로드 성공',
  })
  async uploadServiceImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    const result = await this.filesService.uploadImage(file, 'services');
    return new SuccessBaseResponseDto(
      '서비스 이미지를 업로드했습니다.',
      result,
    );
  }

  @Post('upload/portfolio-image')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '포트폴리오 이미지 업로드',
    description: '포트폴리오용 이미지 파일을 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '포트폴리오 이미지 업로드 성공',
  })
  async uploadPortfolioImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    const result = await this.filesService.uploadImage(file, 'portfolio');
    return new SuccessBaseResponseDto(
      '포트폴리오 이미지를 업로드했습니다.',
      result,
    );
  }

  @Post('upload/reservation-images')
  @UseInterceptors(FilesInterceptor('files', 5)) // 최대 5개 파일
  @ApiOperation({
    summary: '예약 이미지 업로드',
    description: '예약용 이미지 파일들을 업로드합니다 (최대 5개).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '예약 이미지 업로드 성공',
  })
  async uploadReservationImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    const results = await Promise.all(
      files.map((file) => this.filesService.uploadImage(file, 'reservations')),
    );

    return new SuccessBaseResponseDto('예약 이미지를 업로드했습니다.', results);
  }

  @Post('upload/review-images')
  @UseInterceptors(FilesInterceptor('files', 5)) // 최대 5개 파일
  @ApiOperation({
    summary: '리뷰 이미지 업로드',
    description: '리뷰용 이미지 파일들을 업로드합니다 (최대 5개).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '리뷰 이미지 업로드 성공',
  })
  async uploadReviewImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    const results = await Promise.all(
      files.map((file) => this.filesService.uploadImage(file, 'reviews')),
    );

    return new SuccessBaseResponseDto('리뷰 이미지를 업로드했습니다.', results);
  }

  @Post('upload/document')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: '문서 파일 업로드',
    description: '문서 파일을 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '문서 업로드 성공',
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(ERROR_MESSAGES.FILES.NOT_SELECTED);
    }

    // 문서 파일 형식 검증
    const allowedDocTypes = ['.pdf', '.doc', '.docx', '.hwp', '.txt'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();

    if (!allowedDocTypes.includes(`.${fileExtension}`)) {
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.UNSUPPORTED_DOCUMENT_FORMAT,
      );
    }

    try {
      // 실제 파일 저장 로직
      const result = await this.filesService.uploadDocument(file);

      return new SuccessBaseResponseDto('문서를 성공적으로 업로드했습니다.', {
        originalName: file.originalname,
        filename: result.filename,
        url: result.url,
        size: FileUtil.formatFileSize(file.size),
        mimeType: file.mimetype,
        extension: `.${fileExtension}`,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new BadRequestException(
        ERROR_MESSAGES.FILES.DOCUMENT_UPLOAD_ERROR(error.message),
      );
    }
  }

  @Post(':category/:filename/delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: '파일 삭제',
    description: '업로드된 파일을 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '파일 삭제 성공',
  })
  async deleteFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
  ) {
    const url = `/uploads/${category}/${filename}`;
    const filepath = this.filesService.getFilePathFromUrl(url);

    await this.filesService.deleteFile(filepath);
    return new SuccessBaseResponseDto('파일을 삭제했습니다.', null);
  }
}
