import { DataSource } from 'typeorm';
import { CalendarSetting } from '../../modules/calendar/entities/calendar-setting.entity';

export class CalendarSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const calendarSettingRepository = dataSource.getRepository(CalendarSetting);

    const settings = [
      { dayOfWeek: 0, openTime: null, closeTime: null, isHoliday: true }, // 일요일 - 휴무
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 월요일
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 화요일
      { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 수요일
      { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 목요일
      { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 금요일
      { dayOfWeek: 6, openTime: '09:00', closeTime: '15:00', isHoliday: false }, // 토요일 - 단축 근무
    ];

    for (const settingData of settings) {
      const existing = await calendarSettingRepository.findOne({
        where: { dayOfWeek: settingData.dayOfWeek },
      });

      if (!existing) {
        const setting = calendarSettingRepository.create(settingData);
        await calendarSettingRepository.save(setting);
        console.log(`✅ Calendar setting created for day ${settingData.dayOfWeek}`);
      }
    }
  }
}
