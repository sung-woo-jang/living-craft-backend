import {
  Controller,
  Post,
  Delete,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Param,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { FilesService } from './files.service';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { UserRole } from '@common/enums';

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
      throw new BadRequestException('파일이 선택되지 않았습니다.');
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
      throw new BadRequestException('파일이 선택되지 않았습니다.');
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
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    const result = await this.filesService.uploadImage(file, 'portfolio');
    return new SuccessBaseResponseDto(
      '포트폴리오 이미지를 업로드했습니다.',
      result,
    );
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
      throw new BadRequestException('파일이 선택되지 않았습니다.');
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
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    // 문서 파일 형식 검증
    const allowedDocTypes = ['.pdf', '.doc', '.docx', '.hwp', '.txt'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (!allowedDocTypes.includes(`.${fileExtension}`)) {
      throw new BadRequestException('지원되지 않는 문서 형식입니다. 지원 형식: PDF, DOC, DOCX, HWP, TXT');
    }

    try {
      // 실제 파일 저장 로직
      const result = await this.filesService.uploadDocument(file);
      
      return new SuccessBaseResponseDto('문서를 성공적으로 업로드했습니다.', {
        originalName: file.originalname,
        filename: result.filename,
        url: result.url,
        size: this.formatFileSize(file.size),
        mimeType: file.mimetype,
        extension: `.${fileExtension}`,
        uploadedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new BadRequestException(`문서 업로드 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * 파일 크기를 사람이 읽기 쉽은 형식으로 변환
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  @Delete(':category/:filename')
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
