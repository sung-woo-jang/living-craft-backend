import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { ServiceImage } from './entities/service-image.entity';
import { ServiceType } from '@common/enums';
import { CreateServiceRequestDto } from './dto/request/create-service-request.dto';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceImage)
    private readonly serviceImageRepository: Repository<ServiceImage>,
  ) {}

  /**
   * 서비스 생성
   */
  async create(createDto: CreateServiceRequestDto): Promise<Service> {
    // 정찰제인 경우 가격이 필수
    if (createDto.type === ServiceType.FIXED && !createDto.price) {
      throw new BadRequestException('정찰제 서비스는 가격이 필수입니다.');
    }

    // 견적제인 경우 가격이 있으면 안됨
    if (createDto.type === ServiceType.CUSTOM && createDto.price) {
      throw new BadRequestException(
        '견적제 서비스는 가격을 설정할 수 없습니다.',
      );
    }

    const service = this.serviceRepository.create(createDto);
    return this.serviceRepository.save(service);
  }

  /**
   * 활성화된 서비스 목록 조회 (고객용)
   */
  async findActiveServices(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
      relations: ['images'],
    });
  }

  /**
   * 서비스 목록 조회 (관리자용)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    services: Service[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [services, total] = await this.serviceRepository.findAndCount({
      skip,
      take: limit,
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
      relations: ['images'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { services, meta };
  }

  /**
   * 서비스 타입별 조회
   */
  async findByType(type: ServiceType): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { type, isActive: true },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
      relations: ['images'],
    });
  }

  /**
   * ID로 서비스 조회
   */
  async findById(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['images'],
    });

    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    return service;
  }

  /**
   * 서비스 수정
   */
  async update(
    id: number,
    updateDto: Partial<CreateServiceRequestDto>,
  ): Promise<Service> {
    const service = await this.findById(id);

    // 타입 변경 시 가격 검증
    if (updateDto.type) {
      if (
        updateDto.type === ServiceType.FIXED &&
        !updateDto.price &&
        !service.price
      ) {
        throw new BadRequestException('정찰제 서비스는 가격이 필수입니다.');
      }
      if (
        updateDto.type === ServiceType.CUSTOM &&
        (updateDto.price || service.price)
      ) {
        updateDto.price = null; // 견적제로 변경 시 가격 제거
      }
    }

    Object.assign(service, updateDto);
    return this.serviceRepository.save(service);
  }

  /**
   * 서비스 활성화/비활성화
   */
  async toggleActive(id: number): Promise<Service> {
    const service = await this.findById(id);
    service.isActive = !service.isActive;
    return this.serviceRepository.save(service);
  }

  /**
   * 서비스 삭제
   */
  async remove(id: number): Promise<void> {
    const service = await this.findById(id);
    await this.serviceRepository.remove(service);
  }

  /**
   * 서비스 이미지 추가
   */
  async addImage(
    serviceId: number,
    imageUrl: string,
    isMain = false,
  ): Promise<ServiceImage> {
    const service = await this.findById(serviceId);

    // 메인 이미지로 설정하는 경우 기존 메인 이미지를 일반 이미지로 변경
    if (isMain) {
      await this.serviceImageRepository.update(
        { serviceId, isMain: true },
        { isMain: false },
      );
    }

    const image = this.serviceImageRepository.create({
      serviceId,
      imageUrl,
      isMain,
    });

    return this.serviceImageRepository.save(image);
  }

  /**
   * 서비스 이미지 삭제
   */
  async removeImage(imageId: number): Promise<void> {
    const image = await this.serviceImageRepository.findOne({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    await this.serviceImageRepository.remove(image);
  }

  /**
   * 서비스 이미지 메인으로 설정
   */
  async setMainImage(
    serviceId: number,
    imageId: number,
  ): Promise<ServiceImage> {
    const service = await this.findById(serviceId);

    // 해당 이미지가 서비스에 속하는지 확인
    const image = await this.serviceImageRepository.findOne({
      where: { id: imageId, serviceId },
    });

    if (!image) {
      throw new NotFoundException('이미지를 찾을 수 없습니다.');
    }

    // 기존 메인 이미지를 일반 이미지로 변경
    await this.serviceImageRepository.update(
      { serviceId, isMain: true },
      { isMain: false },
    );

    // 새로운 메인 이미지 설정
    image.isMain = true;
    return this.serviceImageRepository.save(image);
  }

  /**
   * 서비스 순서 변경
   */
  async updateDisplayOrder(id: number, displayOrder: number): Promise<Service> {
    const service = await this.findById(id);
    service.displayOrder = displayOrder;
    return this.serviceRepository.save(service);
  }
}
