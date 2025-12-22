import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Or,
  Repository,
} from 'typeorm';
import { Promotion } from './entities';
import {
  CreatePromotionDto,
  ReorderPromotionsDto,
  UpdatePromotionDto,
} from './dto';
import { FilesService } from '@modules/files/files.service';

const PROMOTION_ICON_SIZE = 112; // 2x 해상도 (표시: 56x56)

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly filesService: FilesService,
  ) {}

  // ============================================
  // Public API (Front용)
  // ============================================

  /**
   * 활성 프로모션 목록 조회 (게시 기간 필터 적용)
   */
  async findActivePromotions(): Promise<Promotion[]> {
    const today = new Date().toISOString().split('T')[0];

    return this.promotionRepository.find({
      where: {
        isActive: true,
        // 시작일이 없거나 오늘 이전이고, 종료일이 없거나 오늘 이후
        startDate: Or(IsNull(), LessThanOrEqual(new Date(today))),
        endDate: Or(IsNull(), MoreThanOrEqual(new Date(today))),
      },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 클릭 수 증가
   */
  async incrementClickCount(id: number): Promise<void> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('프로모션을 찾을 수 없습니다.');
    }

    await this.promotionRepository.increment({ id }, 'clickCount', 1);
  }

  // ============================================
  // Admin API
  // ============================================

  /**
   * 전체 프로모션 목록 조회 (관리자)
   */
  async findAll(): Promise<Promotion[]> {
    return this.promotionRepository.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 프로모션 상세 조회
   */
  async findById(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new NotFoundException('프로모션을 찾을 수 없습니다.');
    }

    return promotion;
  }

  /**
   * 프로모션 생성
   */
  async create(
    dto: CreatePromotionDto,
    iconFile?: Express.Multer.File,
  ): Promise<Promotion> {
    let iconUrl: string | undefined;

    // 아이콘 이미지 업로드 (112x112 정사각형)
    if (iconFile) {
      try {
        const uploadResult = await this.filesService.uploadImage(
          iconFile,
          'promotions',
          PROMOTION_ICON_SIZE,
        );
        iconUrl = uploadResult.url;
      } catch (error) {
        throw new BadRequestException(
          `아이콘 이미지 업로드 실패: ${error.message}`,
        );
      }
    }

    // 다음 정렬 순서 계산
    const lastPromotion = await this.promotionRepository.findOne({
      order: { sortOrder: 'DESC' },
      where: {},
    });
    const nextSortOrder = dto.sortOrder ?? (lastPromotion?.sortOrder ?? 0) + 1;

    try {
      const promotion = this.promotionRepository.create({
        title: dto.title,
        subtitle: dto.subtitle,
        iconUrl,
        linkUrl: dto.linkUrl,
        linkType: dto.linkType,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isActive: dto.isActive ?? true,
        sortOrder: nextSortOrder,
      });

      return this.promotionRepository.save(promotion);
    } catch (error) {
      // 실패 시 업로드된 이미지 삭제
      if (iconUrl) {
        await this.cleanupUploadedFile(iconUrl);
      }
      throw error;
    }
  }

  /**
   * 프로모션 수정
   */
  async update(
    id: number,
    dto: UpdatePromotionDto,
    iconFile?: Express.Multer.File,
  ): Promise<Promotion> {
    const promotion = await this.findById(id);
    const oldIconUrl = promotion.iconUrl;

    try {
      // 새 아이콘 이미지가 있으면 업로드
      if (iconFile) {
        const uploadResult = await this.filesService.uploadImage(
          iconFile,
          'promotions',
          PROMOTION_ICON_SIZE,
        );
        promotion.iconUrl = uploadResult.url;

        // 기존 이미지 삭제
        if (oldIconUrl) {
          await this.cleanupUploadedFile(oldIconUrl);
        }
      }

      // 필드 업데이트
      if (dto.title !== undefined) promotion.title = dto.title;
      if (dto.subtitle !== undefined) promotion.subtitle = dto.subtitle;
      if (dto.linkUrl !== undefined) promotion.linkUrl = dto.linkUrl;
      if (dto.linkType !== undefined) promotion.linkType = dto.linkType;
      if (dto.startDate !== undefined)
        promotion.startDate = dto.startDate ? new Date(dto.startDate) : null;
      if (dto.endDate !== undefined)
        promotion.endDate = dto.endDate ? new Date(dto.endDate) : null;
      if (dto.isActive !== undefined) promotion.isActive = dto.isActive;
      if (dto.sortOrder !== undefined) promotion.sortOrder = dto.sortOrder;

      return this.promotionRepository.save(promotion);
    } catch (error) {
      // 실패 시 새 이미지만 정리
      if (iconFile && promotion.iconUrl !== oldIconUrl) {
        await this.cleanupUploadedFile(promotion.iconUrl);
      }
      throw error;
    }
  }

  /**
   * 프로모션 삭제
   */
  async delete(id: number): Promise<void> {
    const promotion = await this.findById(id);

    // 아이콘 이미지 삭제
    if (promotion.iconUrl) {
      await this.cleanupUploadedFile(promotion.iconUrl);
    }

    await this.promotionRepository.remove(promotion);
  }

  /**
   * 활성/비활성 토글
   */
  async toggle(id: number): Promise<Promotion> {
    const promotion = await this.findById(id);
    promotion.isActive = !promotion.isActive;
    return this.promotionRepository.save(promotion);
  }

  /**
   * 정렬 순서 변경
   */
  async reorder(dto: ReorderPromotionsDto): Promise<Promotion[]> {
    const updates = dto.items.map(async (item) => {
      await this.promotionRepository.update(item.id, {
        sortOrder: item.sortOrder,
      });
    });

    await Promise.all(updates);
    return this.findAll();
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * 업로드된 파일 정리
   */
  private async cleanupUploadedFile(url: string): Promise<void> {
    try {
      const s3Key = this.filesService.getFilePathFromUrl(url);
      await this.filesService.deleteFile(s3Key);
    } catch (error) {
      console.error('파일 정리 중 오류 발생:', error);
    }
  }
}
