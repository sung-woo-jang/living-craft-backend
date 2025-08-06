import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { CalendarSetting } from '@modules/calendar/entities/calendar-setting.entity';
import { BlockedDate } from '@modules/calendar/entities/blocked-date.entity';

export default class CalendarSeeder implements Seeder {
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
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
        where: { dayOfWeek: settingData.dayOfWeek },
      });

      if (!existingSetting) {
        const setting = new CalendarSetting(settingData);
        await calendarSettingRepository.save(setting);
        console.log(
          `✅ Calendar setting created for day ${settingData.dayOfWeek}`,
        );
      }
    }

    // 현재 차단된 날짜 개수 확인
    const existingBlockedDatesCount = await blockedDateRepository.count();

    // 최소 25개의 차단된 날짜가 없으면 추가 생성 (테스트용 데이터 확장)
    const blockedDatesToCreate = Math.max(0, 25 - existingBlockedDatesCount);

    if (blockedDatesToCreate > 0) {
      console.log(`📊 Creating ${blockedDatesToCreate} blocked dates for testing...`);
      
      let createdCount = 0;
      // 개별 생성으로 중복 방지
      for (let i = 0; i < blockedDatesToCreate; i++) {
        try {
          await factoryManager.get(BlockedDate).save();
          createdCount++;
        } catch (error) {
          // 중복 날짜로 인한 에러는 무시 (unique constraint)
          console.log('⚠️ Skipped duplicate blocked date');
        }
      }
      
      console.log(`✅ Created ${createdCount} blocked dates`);
    } else {
      console.log(`✅ Blocked dates count sufficient: ${existingBlockedDatesCount} blocked dates exist`);
    }
  }
}
