import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { PortfolioImage } from '@modules/portfolio/entities/portfolio-image.entity';

export default class PortfolioSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const portfolioRepository = dataSource.getRepository(PortfolioImage);

    // 기본 포트폴리오 이미지들
    const basePortfolios = [
      {
        title: '아파트 일반 청소 사례',
        description:
          '30평 아파트 전체 일반 청소 작업 사례입니다. 거실, 침실, 주방, 화장실을 깔끔하게 정리했습니다.',
        beforeImage: '/uploads/portfolio/apt_before_001.jpg',
        afterImage: '/uploads/portfolio/apt_after_001.jpg',
        displayOrder: 1,
      },
      {
        title: '사무실 정기 청소',
        description:
          '30인 규모 사무실 정기 청소 서비스 사례입니다. 책상, 의자, 바닥을 체계적으로 청소했습니다.',
        beforeImage: '/uploads/portfolio/office_before_001.jpg',
        afterImage: '/uploads/portfolio/office_after_001.jpg',
        displayOrder: 2,
      },
      {
        title: '펜션 객실 청소',
        description: '펜션 객실 청소로 다음 손님을 위해 완벽하게 준비했습니다.',
        beforeImage: '/uploads/portfolio/pension_before_001.jpg',
        afterImage: '/uploads/portfolio/pension_after_001.jpg',
        displayOrder: 3,
      },
      {
        title: '이사 후 입주 청소',
        description:
          '이사 후 남은 먼지와 오염물질을 완전히 제거하여 쾌적한 환경를 만들었습니다.',
        beforeImage: '/uploads/portfolio/move_before_001.jpg',
        afterImage: '/uploads/portfolio/move_after_001.jpg',
        displayOrder: 4,
      },
      {
        title: '카페 매장 청소',
        description:
          '개성 있는 카페 공간을 깔끔하게 정리하여 고객들이 편안하게 이용할 수 있도록 했습니다.',
        beforeImage: '/uploads/portfolio/cafe_before_001.jpg',
        afterImage: '/uploads/portfolio/cafe_after_001.jpg',
        displayOrder: 5,
      },
    ];

    // 기본 포트폴리오 생성
    for (const portfolioData of basePortfolios) {
      const existingPortfolio = await portfolioRepository.findOne({
        where: { title: portfolioData.title },
      });

      if (!existingPortfolio) {
        const portfolio = new PortfolioImage(portfolioData);
        await portfolioRepository.save(portfolio);
        console.log(`✅ Base portfolio created: ${portfolioData.title}`);
      }
    }

    // 현재 포트폴리오 개수 확인
    const existingPortfoliosCount = await portfolioRepository.count();

    // 최소 10개의 포트폴리오가 없으면 추가 생성
    const portfoliosToCreate = Math.max(0, 10 - existingPortfoliosCount);

    if (portfoliosToCreate > 0) {
      await factoryManager.get(PortfolioImage).saveMany(portfoliosToCreate);
      console.log(`✅ Created ${portfoliosToCreate} additional portfolios`);
    }

    // 매번 실행 시 2-3개의 포트폴리오 추가 생성
    const additionalPortfolios = await factoryManager
      .get(PortfolioImage)
      .saveMany(
        Math.floor(Math.random() * 2) + 2, // 2-3개
      );

    console.log(`✅ Created ${additionalPortfolios.length} random portfolios`);
  }
}
