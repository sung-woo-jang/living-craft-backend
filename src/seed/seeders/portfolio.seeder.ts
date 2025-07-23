import { DataSource } from 'typeorm';
import { PortfolioImage } from '@modules/portfolio/entities/portfolio-image.entity';

export class PortfolioSeeder {
  private generatePortfolioData(index: number) {
    const basePortfolios = [
      {
        title: '강남구 아파트 일반 청소',
        description: '34평 아파트 전체 청소 작업입니다. 거실, 침실, 화장실, 주방을 꼼꼼히 청소했습니다.',
        imagePath: '/uploads/portfolio/portfolio1.jpg',
      },
      {
        title: '서초구 오피스텔 대청소',
        description: '원룸형 오피스텔 이사 전 대청소 작업입니다. 베란다까지 구석구석 깨끗하게 정리했습니다.',
        imagePath: '/uploads/portfolio/portfolio2.jpg',
      },
      {
        title: '카페 청소 서비스',
        description: '20평 규모의 카페 청소 작업입니다. 영업 전 시간에 맞춰 깨끗하게 정리했습니다.',
        imagePath: '/uploads/portfolio/portfolio3.jpg',
      },
      {
        title: '펜션 대청소',
        description: '10인용 펜션 전체 청소 작업입니다. 다음 손님을 위해 완벽하게 청소했습니다.',
        imagePath: '/uploads/portfolio/portfolio4.jpg',
      },
      {
        title: '신축 빌라 입주 청소',
        description: '신축 빌라 입주 전 청소 작업입니다. 공사 먼지까지 깨끗하게 제거했습니다.',
        imagePath: '/uploads/portfolio/portfolio5.jpg',
      },
    ];

    const additionalPortfolios = [
      {
        title: '소형 사무실 정기 청소',
        description: '10명 규모 소형 사무실의 정기 청소 서비스입니다. 매주 화요일마다 깔끔하게 관리하고 있습니다.',
        imagePath: '/uploads/portfolio/portfolio6.jpg',
      },
      {
        title: '대형 아파트 이사 청소',
        description: '50평대 대형 아파트 이사 전 청소입니다. 3시간에 걸쳐 완벽하게 마무리했습니다.',
        imagePath: '/uploads/portfolio/portfolio7.jpg',
      },
      {
        title: '독채 펜션 청소',
        description: '15인용 독채 펜션 청소 작업입니다. 야외 바베큐장까지 포함하여 전체 청소했습니다.',
        imagePath: '/uploads/portfolio/portfolio8.jpg',
      },
      {
        title: '원룸 정리정돈 서비스',
        description: '대학생 원룸의 정리정돈 서비스입니다. 수납공간 활용도를 높여 깔끔하게 정리했습니다.',
        imagePath: '/uploads/portfolio/portfolio9.jpg',
      },
      {
        title: '신축 상가 준공 청소',
        description: '신축 상가의 준공 후 청소 작업입니다. 개업 전 완벽한 상태로 마무리했습니다.',
        imagePath: '/uploads/portfolio/portfolio10.jpg',
      },
    ];

    const allPortfolios = [...basePortfolios, ...additionalPortfolios];
    const portfolio = allPortfolios[index % allPortfolios.length];
    
    // 인덱스가 기본 포트폴리오 범위를 초과하면 숫자 추가
    if (index >= basePortfolios.length) {
      const suffix = Math.floor(index / allPortfolios.length) + 1;
      return {
        ...portfolio,
        title: `${portfolio.title} ${suffix}차`,
        imagePath: `/uploads/portfolio/portfolio${(index % 10) + 1}.jpg`,
        displayOrder: index + 1,
      };
    }
    
    return {
      ...portfolio,
      displayOrder: index + 1,
    };
  }

  private async createPortfolioIfNotExists(
    portfolioRepository: any,
    portfolioData: any,
  ): Promise<void> {
    const existing = await portfolioRepository.findOne({
      where: { title: portfolioData.title },
    });

    if (!existing) {
      const portfolio = portfolioRepository.create(portfolioData);
      await portfolioRepository.save(portfolio);
      console.log(`✅ Portfolio created: ${portfolioData.title}`);
    } else {
      console.log(`⚠️  Portfolio already exists: ${portfolioData.title}`);
    }
  }

  async run(dataSource: DataSource): Promise<void> {
    const portfolioRepository = dataSource.getRepository(PortfolioImage);
    
    // 기본 포트폴리오 5개는 항상 생성
    const existingPortfoliosCount = await portfolioRepository.count();
    const basePortfoliosToCreate = Math.max(0, 5 - existingPortfoliosCount);
    
    for (let i = existingPortfoliosCount; i < existingPortfoliosCount + basePortfoliosToCreate; i++) {
      const portfolioData = this.generatePortfolioData(i);
      await this.createPortfolioIfNotExists(portfolioRepository, portfolioData);
    }
    
    // 추가 포트폴리오 생성 (실행할 때마다 2개씩 더 추가)
    for (let i = 0; i < 2; i++) {
      const totalPortfolios = await portfolioRepository.count();
      const newPortfolioData = this.generatePortfolioData(totalPortfolios + i);
      await this.createPortfolioIfNotExists(portfolioRepository, newPortfolioData);
    }
  }
}