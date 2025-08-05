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

    // 완료된 예약의 60%에 대해 리뷰 생성
    const reservationsToReview = completedReservationsWithoutReview
      .filter(() => Math.random() < 0.6) // 60% 확률
      .slice(0, 15); // 최대 15개

    for (const reservation of reservationsToReview) {
      try {
        const review = await factoryManager.get(Review).make({
          reservationId: reservation.id,
          userId: reservation.userId, // 예약한 사용자가 리뷰 작성
        });

        await reviewRepository.save(review);
        console.log(
          `✅ Review created for reservation ${reservation.reservationCode}`,
        );
      } catch (error) {
        console.log(
          `⚠️ Failed to create review for reservation ${reservation.reservationCode}: ${error.message}`,
        );
      }
    }

    // 기존 리뷰 개수 확인
    const existingReviewsCount = await reviewRepository.count();

    // 최소 10개의 리뷰가 없으면 랜덤 예약에 대해 추가 생성
    const reviewsToCreate = Math.max(0, 10 - existingReviewsCount);

    if (reviewsToCreate > 0) {
      // 리뷰가 없는 예약들 중 랜덤 선택
      const availableReservations = await reservationRepository
        .createQueryBuilder('reservation')
        .leftJoin('reservation.review', 'review')
        .where('review.id IS NULL')
        .limit(reviewsToCreate)
        .getMany();

      for (const reservation of availableReservations) {
        try {
          const review = await factoryManager.get(Review).make({
            reservationId: reservation.id,
            userId: reservation.userId,
          });

          await reviewRepository.save(review);
        } catch (error) {
          console.log(
            `⚠️ Failed to create additional review: ${error.message}`,
          );
        }
      }

      console.log(`✅ Created ${reviewsToCreate} additional reviews`);
    }

    // 매번 실행 시 2-4개의 리뷰 추가 생성 (가능한 예약에 대해서만)
    const additionalReviewsCount = Math.floor(Math.random() * 3) + 2; // 2-4개
    const additionalAvailableReservations = await reservationRepository
      .createQueryBuilder('reservation')
      .leftJoin('reservation.review', 'review')
      .where('review.id IS NULL')
      .limit(additionalReviewsCount)
      .getMany();

    for (const reservation of additionalAvailableReservations) {
      try {
        const review = await factoryManager.get(Review).make({
          reservationId: reservation.id,
          userId: reservation.userId,
        });

        await reviewRepository.save(review);
      } catch (error) {
        console.log(`⚠️ Failed to create random review: ${error.message}`);
      }
    }

    console.log(
      `✅ Created ${additionalAvailableReservations.length} random reviews`,
    );

    // 최종 리뷰 개수 확인
    const finalCount = await reviewRepository.count();
    console.log(`✅ Total reviews in database: ${finalCount}`);
  }
}
