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

    // 최소 300개의 예약이 없으면 대량 생성 (테스트용 데이터)
    const reservationsToCreate = Math.max(0, 300 - existingReservationsCount);

    if (reservationsToCreate > 0) {
      console.log(`📊 Creating ${reservationsToCreate} reservations for testing...`);
      
      // 배치 처리 (50개씩 나누어 생성)
      const batchSize = 50;
      const batches = Math.ceil(reservationsToCreate / batchSize);
      let totalCreated = 0;

      for (let batch = 0; batch < batches; batch++) {
        const batchCount = Math.min(batchSize, reservationsToCreate - (batch * batchSize));
        let batchCreatedCount = 0;

        console.log(`📦 Processing batch ${batch + 1}/${batches} (${batchCount} reservations)...`);

        for (let i = 0; i < batchCount; i++) {
          try {
            await factoryManager.get(Reservation).save();
            batchCreatedCount++;
          } catch (error) {
            // 중복 예약번호 에러 시 재시도 없이 무시
            console.log(`⚠️ Skipped one reservation due to duplicate code`);
          }
        }

        totalCreated += batchCreatedCount;
        console.log(`✅ Batch ${batch + 1} completed: ${batchCreatedCount} reservations created`);
      }

      console.log(`🎉 Total reservations created: ${totalCreated}`);
    } else {
      console.log(`✅ Reservation count sufficient: ${existingReservationsCount} reservations exist`);
    }

    // 최종 예약 개수 확인
    const finalCount = await reservationRepository.count();
    console.log(`✅ Total reservations in database: ${finalCount}`);
  }
}
