import { DataSource } from 'typeorm';
import { Service } from '@modules/services/entities/service.entity';
import { ServiceType } from '@common/enums';

export class ServiceSeeder {
  private generateServiceData(index: number) {
    const baseServices = [
      {
        name: '일반 청소',
        description:
          '기본적인 집 청소 서비스입니다. 거실, 침실, 화장실, 주방 등 전체 공간을 깨끗하게 청소해드립니다.',
        type: ServiceType.FIXED,
        price: 50000,
        duration: 120,
      },
      {
        name: '대청소',
        description:
          '이사 전후나 대청소가 필요한 경우를 위한 서비스입니다. 평소에 못 미는 곳까지 꼼꼼히 청소해드립니다.',
        type: ServiceType.FIXED,
        price: 80000,
        duration: 180,
      },
      {
        name: '사무실 청소',
        description:
          '사무실, 상가 등 상업공간 청소 서비스입니다. 업무에 지장이 없도록 스케줄 조정이 가능합니다.',
        type: ServiceType.FIXED,
        price: 60000,
        duration: 90,
      },
      {
        name: '맞춤 청소',
        description:
          '고객의 특별한 요구사항이나 특수한 청소가 필요한 경우를 위한 서비스입니다. 견적 후 진행됩니다.',
        type: ServiceType.CUSTOM,
        price: null,
        duration: 120,
      },
      {
        name: '정리정돈',
        description:
          '물건 정리정돈 및 수납 정리 서비스입니다. 깔끔하고 효율적인 공간 활용을 도와드립니다.',
        type: ServiceType.CUSTOM,
        price: null,
        duration: 240,
      },
    ];

    const additionalServices = [
      {
        name: '원룸 청소',
        description:
          '원룸, 오피스텔 전용 청소 서비스입니다. 작은 공간도 꼼꼼하게 관리해드립니다.',
        type: ServiceType.FIXED,
        price: 35000,
        duration: 90,
      },
      {
        name: '펜션/숙박업소 청소',
        description:
          '펜션이나 숙박업소 청소 서비스입니다. 다음 손님을 위해 완벽하게 정리해드립니다.',
        type: ServiceType.FIXED,
        price: 100000,
        duration: 240,
      },
      {
        name: '카페/매장 청소',
        description:
          '카페나 작은 매장의 청소 서비스입니다. 영업 시간을 고려하여 스케줄 조정 가능합니다.',
        type: ServiceType.FIXED,
        price: 70000,
        duration: 120,
      },
      {
        name: '신축/리모델링 후 청소',
        description:
          '신축이나 리모델링 후 발생하는 공사 먼지와 오염물질을 제거하는 전문 청소 서비스입니다.',
        type: ServiceType.CUSTOM,
        price: null,
        duration: 300,
      },
      {
        name: '입주/퇴거 청소',
        description:
          '이사 시 입주 전후 청소 서비스입니다. 보증금 반환을 위한 완벽한 청소를 제공합니다.',
        type: ServiceType.FIXED,
        price: 90000,
        duration: 200,
      },
    ];

    const allServices = [...baseServices, ...additionalServices];
    const service = allServices[index % allServices.length];

    // 인덱스가 기본 서비스 범위를 초과하면 숫자 추가
    if (index >= baseServices.length) {
      const suffix = Math.floor(index / allServices.length) + 1;
      return {
        ...service,
        name: `${service.name} ${suffix}`,
        displayOrder: index + 1,
      };
    }

    return {
      ...service,
      displayOrder: index + 1,
    };
  }

  private async createServiceIfNotExists(
    serviceRepository: any,
    serviceData: any,
  ): Promise<void> {
    const existing = await serviceRepository.findOne({
      where: { name: serviceData.name },
    });

    if (!existing) {
      const service = serviceRepository.create(serviceData);
      await serviceRepository.save(service);
      console.log(`✅ Service created: ${serviceData.name}`);
    } else {
      console.log(`⚠️  Service already exists: ${serviceData.name}`);
    }
  }

  async run(dataSource: DataSource): Promise<void> {
    const serviceRepository = dataSource.getRepository(Service);

    // 기본 서비스 5개는 항상 생성
    const existingServicesCount = await serviceRepository.count();
    const baseServicesToCreate = Math.max(0, 5 - existingServicesCount);

    for (
      let i = existingServicesCount;
      i < existingServicesCount + baseServicesToCreate;
      i++
    ) {
      const serviceData = this.generateServiceData(i);
      await this.createServiceIfNotExists(serviceRepository, serviceData);
    }

    // 추가 서비스 생성 (실행할 때마다 2개씩 더 추가)
    for (let i = 0; i < 2; i++) {
      const totalServices = await serviceRepository.count();
      const newServiceData = this.generateServiceData(totalServices + i);
      await this.createServiceIfNotExists(serviceRepository, newServiceData);
    }
  }
}
