import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceImage } from './entities/service-image.entity';
import { CreateServiceDto } from './dto/request/create-service.dto';
import { UpdateServiceDto } from './dto/request/update-service.dto';
import { ServiceFilterDto } from './dto/request/service-filter.dto';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceImage)
    private readonly serviceImageRepository: Repository<ServiceImage>,
  ) {}

  async findById(id: number): Promise<Service | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['images'],
      order: {
        images: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async findAll(filter: ServiceFilterDto): Promise<[Service[], number]> {
    const { skip, take, sortBy, sortOrder, type, isActive, search } = filter;

    const where: FindOptionsWhere<Service> = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.images', 'images')
      .orderBy('images.displayOrder', 'ASC');

    // 검색 조건 추가
    if (search) {
      queryBuilder.where(
        '(service.name ILIKE :search OR service.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 필터 조건 추가
    if (type) {
      queryBuilder.andWhere('service.type = :type', { type });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('service.isActive = :isActive', { isActive });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy(`service.${sortBy}`, sortOrder)
      .addOrderBy('service.displayOrder', 'ASC')
      .skip(skip)
      .take(take);

    return queryBuilder.getManyAndCount();
  }

  async findActiveServices(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { isActive: true },
      relations: ['images'],
      order: {
        displayOrder: 'ASC',
        images: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async findByType(type: string): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { type: type as any, isActive: true },
      relations: ['images'],
      order: {
        displayOrder: 'ASC',
        images: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const service = this.serviceRepository.create(createServiceDto);
    const savedService = await this.serviceRepository.save(service);
    return this.findById(savedService.id);
  }

  async update(
    id: number,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    await this.serviceRepository.update(id, updateServiceDto);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.serviceRepository.softDelete(id);
  }

  async updateDisplayOrder(id: number, displayOrder: number): Promise<void> {
    await this.serviceRepository.update(id, { displayOrder });
  }

  async toggleActive(id: number): Promise<Service> {
    const service = await this.findById(id);
    if (service) {
      await this.serviceRepository.update(id, { isActive: !service.isActive });
    }
    return this.findById(id);
  }

  // Service Images
  async addImage(
    serviceId: number,
    imageUrl: string,
    isMain: boolean = false,
    description?: string,
  ): Promise<ServiceImage> {
    // 메인 이미지가 되는 경우 기존 메인 이미지를 해제
    if (isMain) {
      await this.serviceImageRepository.update(
        { serviceId, isMain: true },
        { isMain: false },
      );
    }

    // 표시 순서 계산
    const lastImage = await this.serviceImageRepository.findOne({
      where: { serviceId },
      order: { displayOrder: 'DESC' },
    });

    const displayOrder = lastImage ? lastImage.displayOrder + 1 : 0;

    const serviceImage = this.serviceImageRepository.create({
      serviceId,
      imageUrl,
      isMain,
      description,
      displayOrder,
    });

    return this.serviceImageRepository.save(serviceImage);
  }

  async removeImage(imageId: number): Promise<void> {
    await this.serviceImageRepository.delete(imageId);
  }

  async updateImageOrder(imageId: number, displayOrder: number): Promise<void> {
    await this.serviceImageRepository.update(imageId, { displayOrder });
  }

  async setMainImage(serviceId: number, imageId: number): Promise<void> {
    // 기존 메인 이미지 해제
    await this.serviceImageRepository.update(
      { serviceId, isMain: true },
      { isMain: false },
    );

    // 새 메인 이미지 설정
    await this.serviceImageRepository.update(imageId, { isMain: true });
  }

  async getImages(serviceId: number): Promise<ServiceImage[]> {
    return this.serviceImageRepository.find({
      where: { serviceId },
      order: { displayOrder: 'ASC' },
    });
  }

  async count(): Promise<number> {
    return this.serviceRepository.count();
  }

  async countByType(type: string): Promise<number> {
    return this.serviceRepository.count({
      where: { type: type as any, isActive: true },
    });
  }

  async getPopularServices(limit: number = 5): Promise<Service[]> {
    // 예약 수가 많은 서비스 (추후 예약 모듈과 연동)
    return this.serviceRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['images'],
    });
  }
}
