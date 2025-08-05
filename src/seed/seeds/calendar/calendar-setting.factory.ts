import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { CalendarSetting } from '@modules/calendar/entities/calendar-setting.entity';

const CalendarSettingFactory = localeKoSetSeederFactory(
  CalendarSetting,
  (faker) => {
    const dayOfWeek = faker.number.int({ min: 0, max: 6 });
    const isHoliday = faker.datatype.boolean(0.2); // 20% 확률로 휴무일

    // 휴무일이 아닌 경우만 영업시간 설정
    let openTime: string | undefined;
    let closeTime: string | undefined;

    if (!isHoliday) {
      const openHour = faker.number.int({ min: 8, max: 10 }); // 8-10시 오픈
      const closeHour = faker.number.int({ min: 17, max: 20 }); // 17-20시 마감

      openTime = `${openHour.toString().padStart(2, '0')}:00`;
      closeTime = `${closeHour.toString().padStart(2, '0')}:00`;
    }

    return new CalendarSetting({
      dayOfWeek,
      openTime,
      closeTime,
      isHoliday,
    });
  },
);

export default CalendarSettingFactory;
