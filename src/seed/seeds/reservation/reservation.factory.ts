import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { Reservation } from '@modules/reservations/entities/reservation.entity';
import { ReservationStatus } from '@common/enums';

const ReservationFactory = localeKoSetSeederFactory(Reservation, (faker) => {
  // 예약번호 생성 (YYYYMMDD-0001 형식)
  const randomDate = faker.date.recent({ days: 30 });
  const dateString = randomDate.toISOString().slice(0, 10).replace(/-/g, '');
  const sequenceNumber = faker.number
    .int({ min: 1, max: 9999 })
    .toString()
    .padStart(4, '0');
  const reservationCode = `${dateString}-${sequenceNumber}`;

  // 서울 지역명
  const districts = [
    '강남구',
    '서초구',
    '송파구',
    '강동구',
    '마포구',
    '영등포구',
    '용산구',
    '성동구',
    '종로구',
    '중구',
  ];

  const streets = [
    '테헤란로',
    '서초대로',
    '올림픽로',
    '강변북로',
    '마포대로',
    '여의대로',
    '한강대로',
    '왕십리로',
    '종로',
    '을지로',
  ];

  // 미래 서비스 날짜 (다음 7-60일 사이)
  const serviceDateFuture = faker.date.soon({ days: 60 });
  serviceDateFuture.setDate(serviceDateFuture.getDate() + 7); // 최소 7일 후

  // 서비스 시간 (9시-17시 사이, 1시간 단위)
  const serviceHours = [
    '09:00',
    '10:00',
    '11:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];
  const serviceTime = faker.helpers.arrayElement(serviceHours);

  // 상태별 확률 (대부분 확정 상태)
  const status = faker.helpers.weightedArrayElement([
    { weight: 60, value: ReservationStatus.CONFIRMED },
    { weight: 20, value: ReservationStatus.PENDING },
    { weight: 15, value: ReservationStatus.COMPLETED },
    { weight: 5, value: ReservationStatus.CANCELLED },
  ]);

  // 요청사항 예시
  const requestNotes = [
    '2층 화장실 청소 부탁드립니다.',
    '애완동물이 있어서 미리 말씀드립니다.',
    '현관문 비밀번호는 1234입니다.',
    '주차는 지하주차장 B2층을 이용해주세요.',
    '오후 2시 이후에 방문 부탁드립니다.',
    '키를 맡겨드릴게요. 연락주세요.',
    '베란다 쪽은 건드리지 말아주세요.',
    '특별히 신경써야 할 부분은 없습니다.',
  ];

  return new Reservation({
    reservationCode,
    status,
    customerName: faker.person.fullName(),
    customerPhone: faker.helpers.fromRegExp(/010-[0-9]{4}-[0-9]{4}/),
    customerEmail: faker.datatype.boolean(0.7)
      ? faker.internet.email()
      : undefined,
    serviceAddress: `서울시 ${faker.helpers.arrayElement(districts)} ${faker.helpers.arrayElement(streets)} ${faker.number.int({ min: 1, max: 999 })}`,
    serviceDate: serviceDateFuture,
    serviceTime,
    requestNote: faker.datatype.boolean(0.6)
      ? faker.helpers.arrayElement(requestNotes)
      : undefined,
    totalPrice: faker.datatype.boolean(0.8)
      ? Math.floor(faker.number.int({ min: 6, max: 30 }) * 5000)
      : undefined,
    isPaid:
      status === ReservationStatus.COMPLETED
        ? true
        : faker.datatype.boolean(0.3),
    userId: faker.datatype.boolean(0.7)
      ? faker.number.int({ min: 1, max: 20 })
      : undefined, // 70% 확률로 회원
    serviceId: faker.number.int({ min: 1, max: 10 }),
  });
});

export default ReservationFactory;
