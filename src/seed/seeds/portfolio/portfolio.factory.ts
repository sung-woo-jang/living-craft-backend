import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { PortfolioImage } from '@modules/portfolio/entities/portfolio-image.entity';

const PortfolioFactory = localeKoSetSeederFactory(PortfolioImage, (faker) => {
  // 포트폴리오 카테고리별 제목과 설명
  const portfolioCategories = [
    {
      type: 'apartment',
      titles: [
        '아파트 일반 청소',
        '아파트 대청소',
        '신축 아파트 입주 청소',
        '아파트 이사 청소',
      ],
      descriptions: [
        '30평 아파트 전체 일반 청소 작업 사례입니다.',
        '50평 아파트 대청소 작업으로 구석구석 깔끔하게 정리했습니다.',
        '신축 아파트 입주 전 완벽 청소 서비스 사례입니다.',
        '이사 후 남은 먼지와 오염물질을 완전히 제거했습니다.',
      ],
    },
    {
      type: 'office',
      titles: ['사무실 청소', '카페 청소', '매장 청소', '상가 청소'],
      descriptions: [
        '30인 규모 사무실 정기 청소 서비스 사례입니다.',
        '개성 있는 카페 공간을 깔끔하게 정리했습니다.',
        '의류 매장 청소로 고객들이 쾌적하게 쇼핑할 수 있도록 했습니다.',
        '음식점 청소로 위생적인 환경을 만들어드렸습니다.',
      ],
    },
    {
      type: 'house',
      titles: ['단독주택 청소', '빌라 청소', '펜션 청소', '원룸 청소'],
      descriptions: [
        '2층 단독주택 전체 청소 작업 사례입니다.',
        '다세대 빌라 청소로 쾌적한 환경을 만들었습니다.',
        '펜션 객실 청소로 다음 손님을 위해 완벽하게 준비했습니다.',
        '원룸 월세 정리 청소로 보증금 반환에 도움을 드렸습니다.',
      ],
    },
    {
      type: 'special',
      titles: ['창고 정리', '수납 정리', '옷장 정리', '베란다 청소'],
      descriptions: [
        '다용도실 및 창고 정리로 활용도를 높였습니다.',
        '체계적인 수납 정리로 공간 활용을 극대화했습니다.',
        '계절별 옷장 정리로 편리한 의류 관리를 도와드렸습니다.',
        '베란다 청소 및 정리로 생활 공간을 확장했습니다.',
      ],
    },
  ];

  const category = faker.helpers.arrayElement(portfolioCategories);
  const titleIndex = faker.number.int({
    min: 0,
    max: category.titles.length - 1,
  });
  const title = category.titles[titleIndex];
  const description = category.descriptions[titleIndex];

  // 실제 업로드된 포트폴리오 이미지 파일들 (portfolio-1.jpg ~ portfolio-20.jpg)
  const availableImages = Array.from({ length: 20 }, (_, i) => 
    `/uploads/portfolio/portfolio-${i + 1}.jpg`
  );

  // beforeImage와 afterImage가 항상 다른 이미지가 되도록 보장
  const shuffledImages = faker.helpers.shuffle([...availableImages]);
  const beforeImage = shuffledImages[0]; // 항상 이미지 할당
  const afterImage = shuffledImages[1]; // beforeImage와 다른 이미지 할당

  return new PortfolioImage({
    title,
    description,
    beforeImage,
    afterImage,
    displayOrder: faker.number.int({ min: 1, max: 100 }),
    isActive: true, // 포트폴리오는 기본적으로 모두 활성화
    serviceId: faker.datatype.boolean(0.8)
      ? faker.number.int({ min: 1, max: 10 })
      : undefined,
  });
});

export default PortfolioFactory;
