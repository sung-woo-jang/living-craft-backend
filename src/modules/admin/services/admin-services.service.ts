import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceRegion } from '@modules/services/entities';
import { District } from '@modules/admin/districts/entities';
import { CreateServiceDto, UpdateServiceDto } from './dto/request';

@Injectable()
export class AdminServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceRegion)
    private readonly serviceRegionRepository: Repository<ServiceRegion>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
  ) {}

  /**
   * 서비스 목록 조회 (관리자)
   */
  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { isActive: true },
      relations: ['serviceRegions', 'serviceRegions.district'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * 서비스 상세 조회
   */
  async findById(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['serviceRegions', 'serviceRegions.district'],
    });

    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    return service;
  }

  /**
   * 서비스 생성
   */
  async create(dto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create({
      title: dto.title,
      description: dto.description,
      iconName: dto.iconName,
      iconBgColor: dto.iconBgColor,
      duration: dto.duration,
      requiresTimeSelection: dto.requiresTimeSelection,
    });

    const savedService = await this.serviceRepository.save(service);

    // 서비스 가능 지역 설정
    if (dto.serviceableRegions && dto.serviceableRegions.length > 0) {
      await this.updateServiceRegions(savedService.id, dto.serviceableRegions);
    }

    return this.findById(savedService.id);
  }

  /**
   * 서비스 수정
   */
  async update(id: number, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findById(id);

    if (dto.title !== undefined) service.title = dto.title;
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.iconName !== undefined) service.iconName = dto.iconName;
    if (dto.iconBgColor !== undefined) service.iconBgColor = dto.iconBgColor;
    if (dto.duration !== undefined) service.duration = dto.duration;
    if (dto.requiresTimeSelection !== undefined)
      service.requiresTimeSelection = dto.requiresTimeSelection;

    await this.serviceRepository.save(service);

    // 서비스 가능 지역 업데이트
    if (dto.serviceableRegions !== undefined) {
      await this.updateServiceRegions(id, dto.serviceableRegions);
    }

    return this.findById(id);
  }

  /**
   * 서비스 삭제 (soft delete)
   */
  async delete(id: number): Promise<void> {
    const service = await this.findById(id);
    service.isActive = false;
    await this.serviceRepository.save(service);
  }

  /**
   * 서비스 가능 지역 업데이트
   */
  private async updateServiceRegions(
    serviceId: number,
    regions: { regionId: number; cityIds: number[] }[],
  ): Promise<void> {
    // 기존 지역 삭제
    await this.serviceRegionRepository.delete({ serviceId });

    // 새 지역 추가
    for (const region of regions) {
      // 지역의 모든 도시에 대해 ServiceRegion 생성
      for (const cityId of region.cityIds) {
        const district = await this.districtRepository.findOne({
          where: { id: cityId },
        });

        if (district) {
          const serviceRegion = this.serviceRegionRepository.create({
            serviceId,
            districtId: cityId,
            estimateFee: 0, // 기본값 0, 관리자가 나중에 수정 가능
          });
          await this.serviceRegionRepository.save(serviceRegion);
        }
      }
    }
  }
}
