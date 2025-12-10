import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '@modules/portfolios/entities';
import {
  CreatePortfolioDto,
  UpdatePortfolioDto,
  AdminPortfoliosQueryDto,
} from './dto/request';
import { ERROR_MESSAGES } from '@common/constants';

@Injectable()
export class AdminPortfoliosService {
  constructor(
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  /**
   * 포트폴리오 목록 조회 (관리자)
   */
  async findAll(query: AdminPortfoliosQueryDto): Promise<{
    items: Portfolio[];
    total: number;
  }> {
    const { category, page = 1, limit = 20 } = query;

    const whereClause: any = {};

    if (category) {
      whereClause.category = category;
    }

    const [items, total] = await this.portfolioRepository.findAndCount({
      where: whereClause,
      relations: ['service'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  /**
   * 포트폴리오 상세 조회
   */
  async findById(id: number): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!portfolio) {
      throw new NotFoundException(ERROR_MESSAGES.PORTFOLIO.NOT_FOUND);
    }

    return portfolio;
  }

  /**
   * 포트폴리오 생성
   */
  async create(dto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create({
      category: dto.category,
      projectName: dto.projectName,
      client: dto.client,
      duration: dto.duration,
      description: dto.description,
      detailedDescription: dto.detailedDescription,
      images: dto.images,
      tags: dto.tags || [],
      serviceId: dto.relatedServiceId,
    });

    const savedPortfolio = await this.portfolioRepository.save(portfolio);
    return this.findById(savedPortfolio.id);
  }

  /**
   * 포트폴리오 수정
   */
  async update(id: number, dto: UpdatePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findById(id);

    if (dto.category !== undefined) portfolio.category = dto.category;
    if (dto.projectName !== undefined) portfolio.projectName = dto.projectName;
    if (dto.client !== undefined) portfolio.client = dto.client;
    if (dto.duration !== undefined) portfolio.duration = dto.duration;
    if (dto.description !== undefined) portfolio.description = dto.description;
    if (dto.detailedDescription !== undefined)
      portfolio.detailedDescription = dto.detailedDescription;
    if (dto.images !== undefined) portfolio.images = dto.images;
    if (dto.tags !== undefined) portfolio.tags = dto.tags;
    if (dto.relatedServiceId !== undefined)
      portfolio.serviceId = dto.relatedServiceId;

    await this.portfolioRepository.save(portfolio);
    return this.findById(id);
  }

  /**
   * 포트폴리오 삭제 (soft delete)
   */
  async delete(id: number): Promise<void> {
    const portfolio = await this.findById(id);
    portfolio.isActive = false;
    await this.portfolioRepository.save(portfolio);
  }
}
