import { DataSource } from 'typeorm';
import { Review } from '@modules/reviews/entities/review.entity';
import { User } from '@modules/users/entities/user.entity';
import { Service } from '@modules/services/entities/service.entity';
import { UserRole } from '@common/enums';

export class ReviewSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const reviewRepository = dataSource.getRepository(Review);
    const userRepository = dataSource.getRepository(User);
    const serviceRepository = dataSource.getRepository(Service);

    // 기존 사용자와 서비스 조회
    const customers = await userRepository.find({
      where: { role: UserRole.CUSTOMER },
      take: 3,
    });

    const services = await serviceRepository.find({ take: 3 });

    if (customers.length === 0 || services.length === 0) {
      console.log(
        '⚠️  Users or services not found. Run user and service seeders first.',
      );
      return;
    }

    const reviews = [
      {
        rating: 5,
        comment:
          '정말 깨끗하게 청소해주셨어요! 특히 화장실이 완전히 새것 같네요. 다음에도 꼭 부탁드릴게요.',
        customerId: customers[0]?.id,
        serviceId: services[0]?.id,
        customerName: customers[0]?.name || '김고객',
        customerPhone: customers[0]?.phone || '010-1111-1111',
        isAnonymous: false,
      },
      {
        rating: 4,
        comment:
          '전반적으로 만족합니다. 시간도 약속대로 지켜주시고 친절하게 해주셨어요. 작은 부분만 아쉬웠지만 그래도 추천합니다.',
        customerId: customers[1]?.id,
        serviceId: services[1]?.id,
        customerName: customers[1]?.name || '이고객',
        customerPhone: customers[1]?.phone || '010-2222-2222',
        isAnonymous: false,
      },
      {
        rating: 5,
        comment:
          '사무실 청소를 맡겼는데 직원들이 모두 만족해했습니다. 업무에 방해되지 않게 조용히 작업해주셔서 좋았어요.',
        customerId: customers[2]?.id,
        serviceId: services[2]?.id,
        customerName: customers[2]?.name || '박비회원',
        customerPhone: customers[2]?.phone || '010-3333-3333',
        isAnonymous: false,
      },
      {
        rating: 5,
        comment:
          '이사 후 대청소를 부탁했는데 정말 완벽하게 해주셨어요. 구석구석 놓친 곳이 없네요. 감사합니다!',
        customerId: null, // 비회원 리뷰
        serviceId: services[0]?.id,
        customerName: '최고객',
        customerPhone: '010-4444-4444',
        isAnonymous: true,
      },
      {
        rating: 4,
        comment:
          '맞춤 청소 서비스 잘 받았습니다. 요청한 부분을 꼼꼼히 체크해주시고 설명도 자세히 해주셨어요.',
        customerId: null, // 비회원 리뷰
        serviceId: services[1]?.id,
        customerName: '정고객',
        customerPhone: '010-5555-5555',
        isAnonymous: true,
      },
    ];

    for (const reviewData of reviews) {
      const existing = await reviewRepository.findOne({
        where: {
          reservation: {
            customerPhone: reviewData.customerPhone,
            serviceId: reviewData.serviceId,
          },
        },
      });

      if (!existing) {
        const review = reviewRepository.create(reviewData);
        await reviewRepository.save(review);
        console.log(`✅ Review created by: ${reviewData.customerName}`);
      }
    }
  }
}
