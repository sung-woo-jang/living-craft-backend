import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceRegion } from './entities';
import { ServiceListItemDto, ServiceableRegionDto, CityDto } from './dto';
import { District } from '@modules/admin/districts/entities/district.entity';
import { DistrictLevel } from '@common/enums/district-level.enum';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceRegion)
    private readonly serviceRegionRepository: Repository<ServiceRegion>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
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
      iconName: service.iconName,
      iconBgColor: service.iconBgColor,
      duration: service.duration,
      requiresTimeSelection: service.requiresTimeSelection,
      serviceableRegions,
    };
  }

  /**
   * 서비스 지역을 시/도 단위로 그룹핑
   */
  private async groupRegionsBySido(
    serviceRegions: ServiceRegion[],
  ): Promise<ServiceableRegionDto[]> {
    // 시/도 레벨의 지역만 먼저 가져오기
    const sidoRegions = serviceRegions.filter(
      (sr) => sr.district?.level === DistrictLevel.SIDO,
    );

    // 시/군/구 레벨의 지역들
    const sigunguRegions = serviceRegions.filter(
      (sr) => sr.district?.level === DistrictLevel.SIGUNGU,
    );

    const result: ServiceableRegionDto[] = [];

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
}
