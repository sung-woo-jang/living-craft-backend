import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceRegion } from './entities';
import {
  ServiceListItemDto,
  ServiceableRegionDto,
  CityDto,
  ServiceDetailDto,
  CreateServiceDto,
  UpdateServiceDto,
} from './dto';
import { District } from '@modules/admin/districts/entities/district.entity';
import { DistrictLevel } from '@common/enums/district-level.enum';
import { Icon } from '@modules/icons/entities/icon.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceRegion)
    private readonly serviceRegionRepository: Repository<ServiceRegion>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Icon)
    private readonly iconRepository: Repository<Icon>,
  ) {}

  /**
   * 서비스 목록 조회 (지역 정보 포함)
   */
  async findAll(): Promise<ServiceListItemDto[]> {
    // 활성화된 서비스만 조회
    const services = await this.serviceRepository.find({
      where: { isActive: true },
      relations: ['serviceRegions', 'serviceRegions.district'],
      order: { sortOrder: 'ASC', id: 'ASC' },
    });

    return Promise.all(
      services.map(async (service) => this.toServiceListItemDto(service)),
    );
  }

  /**
   * ID로 서비스 조회
   */
  async findById(id: number): Promise<Service | null> {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['serviceRegions', 'serviceRegions.district'],
    });
  }

  /**
   * Service 엔티티를 ServiceListItemDto로 변환
   */
  private async toServiceListItemDto(
    service: Service,
  ): Promise<ServiceListItemDto> {
    // 서비스 가능 지역을 시/도 단위로 그룹핑
    const serviceableRegions = await this.groupRegionsBySido(
      service.serviceRegions,
    );

    return {
      id: service.id.toString(),
      title: service.title,
      description: service.description,
      icon: {
        id: service.icon.id,
        name: service.icon.name,
        type: service.icon.type,
      },
      iconBgColor: service.iconBgColor,
      duration: service.duration,
      requiresTimeSelection: service.requiresTimeSelection,
      serviceableRegions,
    };
  }

  /**
   * 서비스 생성 (트랜잭션)
   */
  async create(dto: CreateServiceDto): Promise<Service> {
    // Icon 유효성 검증
    const icon = await this.iconRepository.findOne({
      where: { id: dto.iconId },
    });
    if (!icon) {
      throw new BadRequestException('존재하지 않는 아이콘 ID입니다.');
    }

    return this.serviceRepository.manager.transaction(async (manager) => {
      // 1. Service 엔티티 생성
      const service = manager.create(Service, {
        title: dto.title,
        description: dto.description,
        iconId: dto.iconId,
        iconBgColor: dto.iconBgColor,
        duration: dto.duration,
        requiresTimeSelection: dto.requiresTimeSelection,
        sortOrder: dto.sortOrder ?? 0,
        isActive: true,
      });

      const savedService = await manager.save(Service, service);

      // 2. ServiceRegion 엔티티 bulk insert
      const serviceRegions = dto.regions.map((region) =>
        manager.create(ServiceRegion, {
          serviceId: savedService.id,
          districtId: region.districtId,
          estimateFee: region.estimateFee,
        }),
      );

      await manager.save(ServiceRegion, serviceRegions);

      // 3. Relations과 함께 다시 조회
      return manager.findOne(Service, {
        where: { id: savedService.id },
        relations: ['serviceRegions', 'serviceRegions.district'],
      });
    });
  }

  /**
   * 서비스 수정 (트랜잭션)
   */
  async update(id: number, dto: UpdateServiceDto): Promise<Service> {
    // Icon ID가 변경되는 경우 유효성 검증
    if (dto.iconId !== undefined) {
      const icon = await this.iconRepository.findOne({
        where: { id: dto.iconId },
      });
      if (!icon) {
        throw new BadRequestException('존재하지 않는 아이콘 ID입니다.');
      }
    }

    return this.serviceRepository.manager.transaction(async (manager) => {
      const service = await manager.findOne(Service, { where: { id } });
      if (!service) {
        throw new NotFoundException('서비스를 찾을 수 없습니다.');
      }

      // Service 필드 업데이트 (필드가 있는 것만)
      const updateData: Partial<Service> = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.description !== undefined)
        updateData.description = dto.description;
      if (dto.iconId !== undefined) updateData.iconId = dto.iconId;
      if (dto.iconBgColor !== undefined)
        updateData.iconBgColor = dto.iconBgColor;
      if (dto.duration !== undefined) updateData.duration = dto.duration;
      if (dto.requiresTimeSelection !== undefined)
        updateData.requiresTimeSelection = dto.requiresTimeSelection;
      if (dto.sortOrder !== undefined) updateData.sortOrder = dto.sortOrder;

      if (Object.keys(updateData).length > 0) {
        await manager.update(Service, { id }, updateData);
      }

      // ServiceRegion 업데이트 (전체 교체)
      if (dto.regions && dto.regions.length > 0) {
        // 기존 지역 정보 삭제
        await manager.delete(ServiceRegion, { serviceId: id });

        // 새로운 지역 정보 삽입
        const serviceRegions = dto.regions.map((region) =>
          manager.create(ServiceRegion, {
            serviceId: id,
            districtId: region.districtId,
            estimateFee: region.estimateFee,
          }),
        );

        await manager.save(ServiceRegion, serviceRegions);
      }

      // Relations과 함께 다시 조회
      return manager.findOne(Service, {
        where: { id },
        relations: ['serviceRegions', 'serviceRegions.district'],
      });
    });
  }

  /**
   * 서비스 삭제 (Soft Delete)
   */
  async delete(id: number): Promise<{ deleted: boolean }> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    await this.serviceRepository.update({ id }, { isActive: false });
    return { deleted: true };
  }

  /**
   * 서비스 활성/비활성 전환
   */
  async toggle(id: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException('서비스를 찾을 수 없습니다.');
    }

    await this.serviceRepository.update(
      { id },
      { isActive: !service.isActive },
    );

    return this.findById(id);
  }

  /**
   * Service 엔티티를 ServiceDetailDto로 변환
   */
  async toServiceDetailDto(service: Service): Promise<ServiceDetailDto> {
    const serviceableRegions = await this.groupRegionsBySido(
      service.serviceRegions,
    );

    return {
      id: service.id.toString(),
      title: service.title,
      description: service.description,
      icon: {
        id: service.icon.id,
        name: service.icon.name,
        type: service.icon.type,
      },
      iconBgColor: service.iconBgColor,
      duration: service.duration,
      requiresTimeSelection: service.requiresTimeSelection,
      isActive: service.isActive,
      sortOrder: service.sortOrder,
      serviceableRegions,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    };
  }

  /**
   * 서비스 지역을 시/도 단위로 그룹핑
   * SIGUNGU 레벨만 있는 경우에도 parentId를 기준으로 시/도별 그룹핑 수행
   */
  private async groupRegionsBySido(
    serviceRegions: ServiceRegion[],
  ): Promise<ServiceableRegionDto[]> {
    // 시/도 레벨의 지역
    const sidoRegions = serviceRegions.filter(
      (sr) => sr.district?.level === DistrictLevel.SIDO,
    );

    // 시/군/구 레벨의 지역들
    const sigunguRegions = serviceRegions.filter(
      (sr) => sr.district?.level === DistrictLevel.SIGUNGU,
    );

    const result: ServiceableRegionDto[] = [];

    // Case 1: SIDO 레벨 데이터가 있는 경우 (기존 로직)
    if (sidoRegions.length > 0) {
      for (const sidoRegion of sidoRegions) {
        const sido = sidoRegion.district;

        // 해당 시/도 하위의 시/군/구 지역 찾기
        const cities: CityDto[] = sigunguRegions
          .filter((sr) => sr.district?.parentId === sido.id)
          .map((sr) => ({
            id: sr.district.id.toString(),
            name: sr.district.name,
            estimateFee:
              Number(sr.estimateFee) !== Number(sidoRegion.estimateFee)
                ? Number(sr.estimateFee)
                : null,
          }));

        // 시/군/구가 없으면 해당 시/도의 모든 시/군/구 조회
        if (cities.length === 0) {
          const allSigungus = await this.districtRepository.find({
            where: {
              parentId: sido.id,
              level: DistrictLevel.SIGUNGU,
              isActive: true,
            },
            order: { name: 'ASC' },
          });

          cities.push(
            ...allSigungus.map((sigungu) => ({
              id: sigungu.id.toString(),
              name: sigungu.name,
              estimateFee: null, // 상위 지역 기본값 사용
            })),
          );
        }

        result.push({
          id: sido.id.toString(),
          name: sido.name,
          estimateFee: Number(sidoRegion.estimateFee),
          cities,
        });
      }

      return result;
    }

    // Case 2: SIGUNGU 레벨만 있는 경우 (새로운 로직)
    // parentId(시/도 ID)를 기준으로 그룹핑
    const sidoGroupMap = new Map<number, ServiceRegion[]>();

    for (const sr of sigunguRegions) {
      const parentId = sr.district?.parentId;
      if (parentId) {
        if (!sidoGroupMap.has(parentId)) {
          sidoGroupMap.set(parentId, []);
        }
        sidoGroupMap.get(parentId).push(sr);
      }
    }

    // 각 시/도별로 결과 생성
    for (const [sidoId, regions] of sidoGroupMap) {
      const sido = await this.districtRepository.findOne({
        where: { id: sidoId },
      });

      if (!sido) continue;

      // 시/도의 기본 출장비 계산 (최소값)
      const baseEstimateFee = Math.min(
        ...regions.map((r) => Number(r.estimateFee)),
      );

      const cities: CityDto[] = regions.map((sr) => ({
        id: sr.district.id.toString(),
        name: sr.district.name,
        estimateFee:
          Number(sr.estimateFee) !== baseEstimateFee
            ? Number(sr.estimateFee)
            : null,
      }));

      result.push({
        id: sido.id.toString(),
        name: sido.name,
        estimateFee: baseEstimateFee,
        cities,
      });
    }

    // 시/도 코드 순으로 정렬
    result.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    return result;
  }
}
