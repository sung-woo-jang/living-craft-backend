import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioImage } from './entities/portfolio-image.entity';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';

export interface CreatePortfolioData {
  title: string;
  description?: string;
  beforeImage?: string;
  afterImage: string;
  serviceId?: number;
  displayOrder?: number;
}

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioImage)
    private readonly portfolioRepository: Repository<PortfolioImage>,
  ) {}

  /**
   * 포트폴리오 생성
   */
  async create(createData: CreatePortfolioData): Promise<PortfolioImage> {
    const portfolio = this.portfolioRepository.create(createData);
    return this.portfolioRepository.save(portfolio);
  }

  /**
   * 활성화된 포트폴리오 목록 조회 (공개)
   */
  async findActivePortfolios(paginationDto: PaginationRequestDto): Promise<{
    portfolios: PortfolioImage[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [portfolios, total] = await this.portfolioRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
      relations: ['service'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { portfolios, meta };
  }

  /**
   * 모든 포트폴리오 목록 조회 (관리자용)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    portfolios: PortfolioImage[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [portfolios, total] = await this.portfolioRepository.findAndCount({
      skip,
      take: limit,
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
      relations: ['service'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { portfolios, meta };
  }

  /**
   * 포트폴리오 상세 조회
   */
  async findById(id: number): Promise<PortfolioImage> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!portfolio) {
      throw new NotFoundException('포트폴리오를 찾을 수 없습니다.');
    }

    return portfolio;
  }

  /**
   * 서비스별 포트폴리오 조회
   */
  async findByServiceId(serviceId: number): Promise<PortfolioImage[]> {
    return this.portfolioRepository.find({
      where: { serviceId, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
      relations: ['service'],
    });
  }

  /**
   * 포트폴리오 수정
   */
  async update(
    id: number,
    updateData: Partial<CreatePortfolioData>,
  ): Promise<PortfolioImage> {
    const portfolio = await this.findById(id);

    Object.assign(portfolio, updateData);
    return this.portfolioRepository.save(portfolio);
  }

  /**
   * 포트폴리오 활성화/비활성화
   */
  async toggleActive(id: number): Promise<PortfolioImage> {
    const portfolio = await this.findById(id);
    portfolio.isActive = !portfolio.isActive;
    return this.portfolioRepository.save(portfolio);
  }

  /**
   * 포트폴리오 순서 변경
   */
  async updateDisplayOrder(
    id: number,
    displayOrder: number,
  ): Promise<PortfolioImage> {
    const portfolio = await this.findById(id);
    portfolio.displayOrder = displayOrder;
    return this.portfolioRepository.save(portfolio);
  }

  /**
   * 포트폴리오 삭제
   */
  async remove(id: number): Promise<void> {
    const portfolio = await this.findById(id);
    await this.portfolioRepository.remove(portfolio);
  }
}
