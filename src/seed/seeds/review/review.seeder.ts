import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Review } from '@modules/reviews/entities/review.entity';
import { Reservation } from '@modules/reservations/entities/reservation.entity';
import { ReservationStatus } from '@common/enums';

export default class ReviewSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const reviewRepository = dataSource.getRepository(Review);
    const reservationRepository = dataSource.getRepository(Reservation);

    // 완료된 예약 중 리뷰가 없는 예약들 가져오기
    const completedReservationsWithoutReview = await reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.review', 'review')
      .where('reservation.status = :status', {
        status: ReservationStatus.COMPLETED,
      })
      .andWhere('review.id IS NULL')
      .getMany();

    console.log(
      `Found ${completedReservationsWithoutReview.length} completed reservations without reviews`,
    );

    // 완료된 예약의 70%에 대해 리뷰 생성 (더 많은 리뷰 생성)
    const reservationsToReview = completedReservationsWithoutReview
      .filter(() => Math.random() < 0.7) // 70% 확률로 증가
      .slice(0, 100); // 최대 100개로 증가

    let reviewsFromCompletedCount = 0;
    for (const reservation of reservationsToReview) {
      try {
        const review = await factoryManager.get(Review).make({
          reservationId: reservation.id,
          userId: reservation.userId,
        });

        await reviewRepository.save(review);
        reviewsFromCompletedCount++;
      } catch (error) {
        console.log(
          `⚠️ Failed to create review for reservation ${reservation.reservationCode}: ${error.message}`,
        );
      }
    }

    console.log(`✅ Created ${reviewsFromCompletedCount} reviews from completed reservations`);

    // 현재 리뷰 개수 확인
    const existingReviewsCount = await reviewRepository.count();

    // 최소 200개의 리뷰가 없으면 대량 생성 (테스트용 데이터)
    const reviewsToCreate = Math.max(0, 200 - existingReviewsCount);

    if (reviewsToCreate > 0) {
      console.log(`📊 Creating ${reviewsToCreate} additional reviews for testing...`);

      // 리뷰가 없는 예약들 대량 조회
      const availableReservations = await reservationRepository
        .createQueryBuilder('reservation')
        .leftJoin('reservation.review', 'review')
        .where('review.id IS NULL')
        .limit(reviewsToCreate)
        .getMany();

      // 배치 처리 (30개씩 나누어 생성)
      const batchSize = 30;
      const batches = Math.ceil(Math.min(availableReservations.length, reviewsToCreate) / batchSize);
      let totalCreated = 0;

      for (let batch = 0; batch < batches; batch++) {
        const startIdx = batch * batchSize;
        const endIdx = Math.min(startIdx + batchSize, availableReservations.length);
        const batchReservations = availableReservations.slice(startIdx, endIdx);
        let batchCreatedCount = 0;

        console.log(`📦 Processing review batch ${batch + 1}/${batches} (${batchReservations.length} reviews)...`);

        for (const reservation of batchReservations) {
          try {
            const review = await factoryManager.get(Review).make({
              reservationId: reservation.id,
              userId: reservation.userId,
            });

            await reviewRepository.save(review);
            batchCreatedCount++;
          } catch (error) {
            console.log(`⚠️ Failed to create review: ${error.message}`);
          }
        }

        totalCreated += batchCreatedCount;
        console.log(`✅ Review batch ${batch + 1} completed: ${batchCreatedCount} reviews created`);
      }

      console.log(`🎉 Total additional reviews created: ${totalCreated}`);
    } else {
      console.log(`✅ Review count sufficient: ${existingReviewsCount} reviews exist`);
    }

    // 최종 리뷰 개수 확인
    const finalCount = await reviewRepository.count();
    console.log(`✅ Total reviews in database: ${finalCount}`);
  }
}
