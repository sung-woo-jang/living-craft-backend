import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { BlockedDate } from '@modules/calendar/entities/blocked-date.entity';

const BlockedDateFactory = localeKoSetSeederFactory(BlockedDate, (faker) => {
  const reasons = [
    '개인 사유',
    '휴가',
    '출장',
    '교육 참석',
    '병원 방문',
    '가족 행사',
    '기타 일정',
    '시설 점검',
    '연휴',
    '공휴일',
  ];

  // 미래 날짜 중 랜덤하게 선택 (향후 90일 이내)
  const blockedDate = faker.date.soon({ days: 90 });

  return new BlockedDate({
    blockedDate,
    reason: faker.helpers.arrayElement(reasons),
  });
});

export default BlockedDateFactory;
