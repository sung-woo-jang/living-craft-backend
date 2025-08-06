import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { ServiceImage } from '@modules/services/entities/service-image.entity';

const ServiceImageFactory = localeKoSetSeederFactory(ServiceImage, (faker) => {
  // uploads/services/ 폴더의 실제 이미지 파일들 (service-1.jpg ~ service-20.jpg)
  const availableImages = Array.from({ length: 20 }, (_, i) => 
    `/uploads/services/service-${i + 1}.jpg`
  );

  const imageUrl = faker.helpers.arrayElement(availableImages);

  return new ServiceImage({
    imageUrl,
    isMain: faker.datatype.boolean(0.3), // 30% 확률로 메인 이미지
    displayOrder: faker.number.int({ min: 1, max: 10 }),
    serviceId: faker.number.int({ min: 1, max: 10 }), // 서비스 ID는 시더에서 실제 값으로 설정
  });
});

export default ServiceImageFactory;