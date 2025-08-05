import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { Service } from '@modules/services/entities/service.entity';
import { ServiceType } from '@common/enums';

const ServiceFactory = localeKoSetSeederFactory(Service, (faker) => {
  const serviceType = faker.helpers.arrayElement([ServiceType.FIXED, ServiceType.CUSTOM]);
  
  // 서비스 카테고리별 이름과 설명
  const serviceCategories = [
    {
      type: 'cleaning',
      names: ['일반 청소', '대청소', '원룸 청소', '사무실 청소', '펜션 청소'],
      descriptions: [
        '기본적인 집 청소 서비스입니다. 거실, 침실, 화장실, 주방을 깨끗하게 정리해드립니다.',
        '이사 전후나 대청소가 필요할 때 이용하는 서비스입니다. 평소 못 미는 곳까지 꼼꼼히 청소합니다.',
        '원룸이나 오피스텔 전용 청소 서비스입니다. 작은 공간도 세심하게 관리해드립니다.',
        '사무실, 상가 등 업무공간 청소 서비스입니다. 업무 시간을 피해 스케줄 조정이 가능합니다.',
        '펜션이나 숙박업소 청소 서비스입니다. 다음 손님을 위해 완벽하게 정리해드립니다.'
      ]
    },
    {
      type: 'organization',
      names: ['정리정돈', '수납 정리', '옷장 정리', '창고 정리', '사무용품 정리'],
      descriptions: [
        '물건 정리정돈 및 수납 정리 서비스입니다. 깔끔하고 효율적인 공간을 만들어드립니다.',
        '옷장, 서랍, 수납장 정리 서비스입니다. 체계적인 수납으로 찾기 쉽게 정리해드립니다.',
        '옷장 정리 전문 서비스입니다. 계절별, 종류별로 체계적으로 정리해드립니다.',
        '창고나 다용도실 정리 서비스입니다. 필요한 물건을 쉽게 찾을 수 있도록 정리합니다.',
        '사무실 서류 및 사무용품 정리 서비스입니다. 업무 효율성을 높여드립니다.'
      ]
    },
    {
      type: 'special',
      names: ['입주/퇴거 청소', '신축 후 청소', '이사 청소', '애프터 서비스', '맞춤 서비스'],
      descriptions: [
        '이사 시 입주 전후 청소 서비스입니다. 보증금 반환을 위한 완벽한 청소를 제공합니다.',
        '신축이나 리모델링 후 발생하는 공사 먼지와 오염물질을 전문적으로 제거합니다.',
        '이사 준비 및 정리 서비스입니다. 짐 포장부터 청소까지 원스톱으로 해결해드립니다.',
        '서비스 후 추가 관리가 필요한 경우를 위한 애프터 서비스입니다.',
        '고객의 특별한 요구사항에 맞춘 맞춤형 서비스입니다. 견적 후 진행됩니다.'
      ]
    }
  ];

  const category = faker.helpers.arrayElement(serviceCategories);
  const nameIndex = faker.number.int({ min: 0, max: category.names.length - 1 });
  const name = category.names[nameIndex];
  const description = category.descriptions[nameIndex];

  // 가격 설정 (정찰제인 경우만)
  let price: number | undefined;
  if (serviceType === ServiceType.FIXED) {
    const basePrices = {
      cleaning: [35000, 50000, 60000, 80000, 100000],
      organization: [40000, 60000, 80000, 100000, 120000],
      special: [70000, 90000, 120000, 150000, 200000]
    };
    price = faker.helpers.arrayElement(basePrices[category.type]);
  }

  // 소요시간 설정
  const durations = {
    cleaning: [90, 120, 150, 180, 240],
    organization: [120, 180, 240, 300, 360],
    special: [180, 240, 300, 360, 480]
  } as const;
  const duration = faker.helpers.arrayElement(durations[category.type as keyof typeof durations]);

  return new Service({
    name,
    description,
    type: serviceType,
    price,
    duration,
    isActive: faker.datatype.boolean(0.9), // 90% 확률로 활성화
    displayOrder: faker.number.int({ min: 1, max: 100 }),
  });
});

export default ServiceFactory;