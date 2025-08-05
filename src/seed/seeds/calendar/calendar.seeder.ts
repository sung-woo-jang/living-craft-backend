import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CalendarSetting } from '@modules/calendar/entities/calendar-setting.entity';
import { BlockedDate } from '@modules/calendar/entities/blocked-date.entity';

export default class CalendarSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const calendarSettingRepository = dataSource.getRepository(CalendarSetting);
    const blockedDateRepository = dataSource.getRepository(BlockedDate);

    // 기본 요일별 영업시간 설정 (월-금: 09:00-18:00, 토: 09:00-15:00, 일: 휴무)
    const defaultSettings = [
      { dayOfWeek: 0, openTime: null, closeTime: null, isHoliday: true }, // 일요일 휴무
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 월요일
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 화요일
      { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 수요일
      { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 목요일
      { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 금요일
      { dayOfWeek: 6, openTime: '09:00', closeTime: '15:00', isHoliday: false }, // 토요일 단축
    ];

    // 기본 영업시간 설정
    for (const settingData of defaultSettings) {
      const existingSetting = await calendarSettingRepository.findOne({
        where: { dayOfWeek: settingData.dayOfWeek }
      });

      if (!existingSetting) {
        const setting = new CalendarSetting(settingData);
        await calendarSettingRepository.save(setting);
        console.log(`✅ Calendar setting created for day ${settingData.dayOfWeek}`);
      }
    }

    // 현재 차단된 날짜 개수 확인
    const existingBlockedDatesCount = await blockedDateRepository.count();

    // 최소 5개의 차단된 날짜가 없으면 추가 생성
    const blockedDatesToCreate = Math.max(0, 5 - existingBlockedDatesCount);
    
    if (blockedDatesToCreate > 0) {
      try {
        await factoryManager.get(BlockedDate).saveMany(blockedDatesToCreate);
        console.log(`✅ Created ${blockedDatesToCreate} blocked dates`);
      } catch (error) {
        // 중복 날짜로 인한 에러는 무시 (unique constraint)
        console.log('⚠️ Some blocked dates already exist, skipping duplicates');
      }
    }

    // 매번 실행 시 1-3개의 차단된 날짜 추가 생성
    try {
      const additionalBlockedDates = Math.floor(Math.random() * 3) + 1; // 1-3개
      await factoryManager.get(BlockedDate).saveMany(additionalBlockedDates);
      console.log(`✅ Created ${additionalBlockedDates} additional blocked dates`);
    } catch (error) {
      console.log('⚠️ Some additional blocked dates already exist, skipping duplicates');
    }
  }
}