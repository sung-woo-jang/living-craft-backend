import { DataSource } from 'typeorm';
import { Reservation } from '@modules/reservations/entities/reservation.entity';
import { User } from '@modules/users/entities/user.entity';
import { Service } from '@modules/services/entities/service.entity';
import { ReservationStatus, UserRole } from '@common/enums';

export class ReservationSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const reservationRepository = dataSource.getRepository(Reservation);
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

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const reservations = [
      {
        reservationCode: '20250724-0001',
        customerId: customers[0]?.id,
        serviceId: services[0]?.id,
        reservationDate: tomorrow,
        status: ReservationStatus.CONFIRMED,
        customerName: customers[0]?.name || '김고객',
        customerPhone: customers[0]?.phone || '010-1111-1111',
        customerAddress: customers[0]?.address || '서울시 강남구 테헤란로 123',
        notes: '2층 화장실 청소 중점적으로 부탁드립니다.',
        totalPrice: services[0]?.price || 50000,
      },
      {
        reservationCode: '20250724-0002',
        customerId: customers[1]?.id,
        serviceId: services[1]?.id,
        reservationDate: nextWeek,
        status: ReservationStatus.PENDING,
        customerName: customers[1]?.name || '이고객',
        customerPhone: customers[1]?.phone || '010-2222-2222',
        customerAddress: customers[1]?.address || '서울시 서초구 서초대로 456',
        notes: '베란다 정리도 포함해 주세요.',
        totalPrice: services[1]?.price || 80000,
      },
      {
        reservationCode: '20250724-0003',
        customerId: null, // 비회원 예약
        serviceId: services[2]?.id,
        reservationDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        status: ReservationStatus.CONFIRMED,
        customerName: '박비회원',
        customerPhone: '010-6666-6666',
        customerAddress: '서울시 송파구 올림픽로 999',
        notes: '사무실 입구부터 회의실까지 전체 청소 부탁드립니다.',
        totalPrice: services[2]?.price || 60000,
      },
      {
        reservationCode: '20250724-0004',
        customerId: customers[2]?.id,
        serviceId: services[0]?.id,
        reservationDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 1주일 전 (완료된 예약)
        status: ReservationStatus.COMPLETED,
        customerName: customers[2]?.name || '박비회원',
        customerPhone: customers[2]?.phone || '010-3333-3333',
        customerAddress: customers[2]?.address || '서울시 송파구 올림픽로 789',
        notes: '이사 후 대청소였는데 정말 깨끗하게 해주셨습니다.',
        totalPrice: services[0]?.price || 50000,
      },
    ];

    for (const reservationData of reservations) {
      const existing = await reservationRepository.findOne({
        where: { reservationCode: reservationData.reservationCode },
      });

      if (!existing) {
        const reservation = reservationRepository.create(reservationData);
        await reservationRepository.save(reservation);
        console.log(
          `✅ Reservation created: ${reservationData.reservationCode}`,
        );
      }
    }
  }
}
