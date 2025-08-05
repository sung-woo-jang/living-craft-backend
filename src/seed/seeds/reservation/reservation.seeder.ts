import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Reservation } from '@modules/reservations/entities/reservation.entity';

export default class ReservationSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const reservationRepository = dataSource.getRepository(Reservation);

    // 현재 예약 개수 확인
    const existingReservationsCount = await reservationRepository.count();

    // 최소 20개의 예약이 없으면 추가 생성
    const reservationsToCreate = Math.max(0, 20 - existingReservationsCount);

    if (reservationsToCreate > 0) {
      try {
        await factoryManager.get(Reservation).saveMany(reservationsToCreate);
        console.log(`✅ Created ${reservationsToCreate} reservations`);
      } catch (error) {
        // 중복 예약번호로 인한 에러는 개별 처리
        console.log(
          '⚠️ Some reservations had duplicate codes, creating individually...',
        );

        for (let i = 0; i < reservationsToCreate; i++) {
          try {
            await factoryManager.get(Reservation).save();
          } catch (individualError) {
            // 개별 실패는 무시하고 계속 진행
            console.log(`⚠️ Skipped one reservation due to duplicate code`);
          }
        }
      }
    }

    // 매번 실행 시 5-10개의 예약 추가 생성
    const additionalReservationsCount = Math.floor(Math.random() * 6) + 5; // 5-10개

    for (let i = 0; i < additionalReservationsCount; i++) {
      try {
        await factoryManager.get(Reservation).save();
      } catch (error) {
        // 중복 예약번호 에러 무시
        console.log(
          `⚠️ Skipped one additional reservation due to duplicate code`,
        );
      }
    }

    console.log(
      `✅ Attempted to create ${additionalReservationsCount} additional reservations`,
    );

    // 최종 예약 개수 확인
    const finalCount = await reservationRepository.count();
    console.log(`✅ Total reservations in database: ${finalCount}`);
  }
}
