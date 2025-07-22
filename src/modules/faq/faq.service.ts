import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';

export interface CreateFaqData {
  question: string;
  answer: string;
  category?: string;
  displayOrder?: number;
}

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(Faq)
    private readonly faqRepository: Repository<Faq>,
  ) {}

  /**
   * FAQ 생성
   */
  async create(createData: CreateFaqData): Promise<Faq> {
    const faq = this.faqRepository.create(createData);
    return this.faqRepository.save(faq);
  }

  /**
   * 활성화된 FAQ 목록 조회 (공개)
   */
  async findActiveFaqs(category?: string): Promise<Faq[]> {
    const queryBuilder = this.faqRepository
      .createQueryBuilder('faq')
      .where('faq.isActive = :isActive', { isActive: true });

    if (category) {
      queryBuilder.andWhere('faq.category = :category', { category });
    }

    return queryBuilder
      .orderBy('faq.displayOrder', 'ASC')
      .addOrderBy('faq.createdAt', 'ASC')
      .getMany();
  }

  /**
   * 모든 FAQ 목록 조회 (관리자용)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    faqs: Faq[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [faqs, total] = await this.faqRepository.findAndCount({
      skip,
      take: limit,
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { faqs, meta };
  }

  /**
   * FAQ 상세 조회
   */
  async findById(id: number): Promise<Faq> {
    const faq = await this.faqRepository.findOne({
      where: { id },
    });

    if (!faq) {
      throw new NotFoundException('FAQ를 찾을 수 없습니다.');
    }

    return faq;
  }

  /**
   * FAQ 수정
   */
  async update(id: number, updateData: Partial<CreateFaqData>): Promise<Faq> {
    const faq = await this.findById(id);

    Object.assign(faq, updateData);
    return this.faqRepository.save(faq);
  }

  /**
   * FAQ 활성화/비활성화
   */
  async toggleActive(id: number): Promise<Faq> {
    const faq = await this.findById(id);
    faq.isActive = !faq.isActive;
    return this.faqRepository.save(faq);
  }

  /**
   * FAQ 순서 변경
   */
  async updateDisplayOrder(id: number, displayOrder: number): Promise<Faq> {
    const faq = await this.findById(id);
    faq.displayOrder = displayOrder;
    return this.faqRepository.save(faq);
  }

  /**
   * FAQ 삭제
   */
  async remove(id: number): Promise<void> {
    const faq = await this.findById(id);
    await this.faqRepository.remove(faq);
  }

  /**
   * 카테고리 목록 조회
   */
  async getCategories(): Promise<string[]> {
    const result = await this.faqRepository
      .createQueryBuilder('faq')
      .select('DISTINCT faq.category', 'category')
      .where('faq.category IS NOT NULL')
      .andWhere('faq.isActive = :isActive', { isActive: true })
      .getRawMany();

    return result.map((item) => item.category).filter(Boolean);
  }
}
