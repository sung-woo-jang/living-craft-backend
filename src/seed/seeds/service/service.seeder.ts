import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Service } from '@modules/services/entities/service.entity';
import { ServiceType } from '@common/enums';

export default class ServiceSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const serviceRepository = dataSource.getRepository(Service);

    // 기본 서비스들을 우선 생성 (고정된 기본 서비스)
    const baseServices = [
      {
        name: '일반 청소',
        description: '기본적인 집 청소 서비스입니다. 거실, 침실, 화장실, 주방 등 전체 공간을 깨끗하게 청소해드립니다.',
        type: ServiceType.FIXED,
        price: 50000,
        duration: 120,
        displayOrder: 1,
      },
      {
        name: '대청소',
        description: '이사 전후나 대청소가 필요한 경우를 위한 서비스입니다. 평소에 못 미는 곳까지 꼼꼼히 청소해드립니다.',
        type: ServiceType.FIXED,
        price: 80000,
        duration: 180,
        displayOrder: 2,
      },
      {
        name: '사무실 청소',
        description: '사무실, 상가 등 상업공간 청소 서비스입니다. 업무에 지장이 없도록 스케줄 조정이 가능합니다.',
        type: ServiceType.FIXED,
        price: 60000,
        duration: 90,
        displayOrder: 3,
      },
      {
        name: '맞춤 청소',
        description: '고객의 특별한 요구사항이나 특수한 청소가 필요한 경우를 위한 서비스입니다. 견적 후 진행됩니다.',
        type: ServiceType.CUSTOM,
        price: null,
        duration: 120,
        displayOrder: 4,
      },
      {
        name: '정리정돈',
        description: '물건 정리정돈 및 수납 정리 서비스입니다. 깔끔하고 효율적인 공간 활용을 도와드립니다.',
        type: ServiceType.CUSTOM,
        price: null,
        duration: 240,
        displayOrder: 5,
      },
    ];

    // 기본 서비스 생성
    for (const serviceData of baseServices) {
      const existingService = await serviceRepository.findOne({
        where: { name: serviceData.name }
      });

      if (!existingService) {
        const service = new Service(serviceData);
        await serviceRepository.save(service);
        console.log(`✅ Base service created: ${serviceData.name}`);
      }
    }

    // 현재 서비스 개수 확인
    const existingServicesCount = await serviceRepository.count();

    // 최소 10개의 서비스가 없으면 추가 생성
    const servicesToCreate = Math.max(0, 10 - existingServicesCount);
    
    if (servicesToCreate > 0) {
      await factoryManager.get(Service).saveMany(servicesToCreate);
      console.log(`✅ Created ${servicesToCreate} additional services`);
    }

    // 매번 실행 시 2-4개의 서비스 추가 생성
    const additionalServices = await factoryManager.get(Service).saveMany(
      Math.floor(Math.random() * 3) + 2 // 2-4개
    );
    
    console.log(`✅ Created ${additionalServices.length} random services`);
  }
}