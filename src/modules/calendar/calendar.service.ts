import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarSetting } from './entities/calendar-setting.entity';
import { BlockedDate } from './entities/blocked-date.entity';
import * as moment from 'moment';

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface AvailableDate {
  date: string;
  available: boolean;
  reason?: string;
}

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(CalendarSetting)
    private readonly calendarSettingRepository: Repository<CalendarSetting>,
    @InjectRepository(BlockedDate)
    private readonly blockedDateRepository: Repository<BlockedDate>,
  ) {}

  /**
   * 예약 가능한 날짜 목록 조회 (최대 3개월)
   */
  async getAvailableDates(months = 3): Promise<AvailableDate[]> {
    const startDate = moment().startOf('day');
    const endDate = moment().add(months, 'months').endOf('month');
    const dates: AvailableDate[] = [];

    // 차단된 날짜 목록 조회
    const blockedDates = await this.blockedDateRepository.find({
      where: {
        blockedDate: Between(startDate.toDate(), endDate.toDate()),
      },
    });

    const blockedDateSet = new Set(
      blockedDates.map((bd) => moment(bd.blockedDate).format('YYYY-MM-DD')),
    );

    // 영업시간 설정 조회
    const calendarSettings = await this.calendarSettingRepository.find();
    const settingsMap = new Map(
      calendarSettings.map((setting) => [setting.dayOfWeek, setting]),
    );

    // 날짜별 가용성 확인
    const current = startDate.clone();
    while (current.isSameOrBefore(endDate)) {
      const dateStr = current.format('YYYY-MM-DD');
      const dayOfWeek = current.day(); // 0: 일요일, 1: 월요일, ...

      let available = true;
      let reason = '';

      // 과거 날짜는 불가
      if (current.isBefore(moment().startOf('day'))) {
        available = false;
        reason = '과거 날짜';
      }
      // 차단된 날짜
      else if (blockedDateSet.has(dateStr)) {
        available = false;
        reason = '예약 불가 날짜';
      }
      // 영업시간 설정 확인
      else {
        const setting = settingsMap.get(dayOfWeek);
        if (
          !setting ||
          setting.isHoliday ||
          !setting.openTime ||
          !setting.closeTime
        ) {
          available = false;
          reason = '휴무일';
        }
      }

      dates.push({
        date: dateStr,
        available,
        reason: available ? undefined : reason,
      });

      current.add(1, 'day');
    }

    return dates;
  }

  /**
   * 특정 날짜의 예약 가능 시간 슬롯
   */
  async getAvailableSlots(date: Date): Promise<AvailableSlot[]> {
    const dayOfWeek = moment(date).day();
    const dateStr = moment(date).format('YYYY-MM-DD');

    // 영업시간 설정 조회
    const setting = await this.calendarSettingRepository.findOne({
      where: { dayOfWeek },
    });

    if (
      !setting ||
      setting.isHoliday ||
      !setting.openTime ||
      !setting.closeTime
    ) {
      return [];
    }

    // 차단된 날짜 확인
    const blockedDate = await this.blockedDateRepository.findOne({
      where: { blockedDate: date },
    });

    if (blockedDate) {
      return [];
    }

    // 시간 슬롯 생성 (30분 간격)
    const slots: AvailableSlot[] = [];
    const openTime = moment(`${dateStr} ${setting.openTime}`);
    const closeTime = moment(`${dateStr} ${setting.closeTime}`);

    const current = openTime.clone();
    while (current.isBefore(closeTime)) {
      const timeStr = current.format('HH:mm');

      // 현재 시간 이후만 예약 가능
      const isAvailable = moment(`${dateStr} ${timeStr}`).isAfter(moment());

      slots.push({
        time: timeStr,
        available: isAvailable,
      });

      current.add(30, 'minutes'); // 30분 간격
    }

    return slots;
  }

  /**
   * 특정 날짜/시간 예약 가능 여부 확인
   */
  async isAvailable(date: Date, time: string): Promise<boolean> {
    const dayOfWeek = moment(date).day();
    const dateStr = moment(date).format('YYYY-MM-DD');
    const dateTime = moment(`${dateStr} ${time}`);

    // 과거 시간인지 확인
    if (dateTime.isSameOrBefore(moment())) {
      return false;
    }

    // 영업시간 설정 확인
    const setting = await this.calendarSettingRepository.findOne({
      where: { dayOfWeek },
    });

    if (
      !setting ||
      setting.isHoliday ||
      !setting.openTime ||
      !setting.closeTime
    ) {
      return false;
    }

    // 영업시간 내인지 확인
    const openTime = moment(`${dateStr} ${setting.openTime}`);
    const closeTime = moment(`${dateStr} ${setting.closeTime}`);

    if (dateTime.isBefore(openTime) || dateTime.isAfter(closeTime)) {
      return false;
    }

    // 차단된 날짜 확인
    const blockedDate = await this.blockedDateRepository.findOne({
      where: { blockedDate: date },
    });

    return !blockedDate;
  }

  /**
   * 영업시간 설정 조회
   */
  async getSettings(): Promise<CalendarSetting[]> {
    return this.calendarSettingRepository.find({
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * 영업시간 설정 업데이트
   */
  async updateSetting(
    dayOfWeek: number,
    openTime?: string,
    closeTime?: string,
    isHoliday?: boolean,
  ): Promise<CalendarSetting> {
    let setting = await this.calendarSettingRepository.findOne({
      where: { dayOfWeek },
    });

    if (!setting) {
      setting = this.calendarSettingRepository.create({ dayOfWeek });
    }

    if (openTime !== undefined) setting.openTime = openTime;
    if (closeTime !== undefined) setting.closeTime = closeTime;
    if (isHoliday !== undefined) setting.isHoliday = isHoliday;

    // 휴무일로 설정하면 시간 정보 제거
    if (isHoliday) {
      setting.openTime = null;
      setting.closeTime = null;
    }

    return this.calendarSettingRepository.save(setting);
  }

  /**
   * 날짜 차단
   */
  async blockDate(date: Date, reason?: string): Promise<BlockedDate> {
    // 이미 차단된 날짜인지 확인
    const existing = await this.blockedDateRepository.findOne({
      where: { blockedDate: date },
    });

    if (existing) {
      existing.reason = reason;
      return this.blockedDateRepository.save(existing);
    }

    const blockedDate = this.blockedDateRepository.create({
      blockedDate: date,
      reason,
    });

    return this.blockedDateRepository.save(blockedDate);
  }

  /**
   * 날짜 차단 해제
   */
  async unblockDate(date: Date): Promise<void> {
    const blockedDate = await this.blockedDateRepository.findOne({
      where: { blockedDate: date },
    });

    if (blockedDate) {
      await this.blockedDateRepository.remove(blockedDate);
    }
  }

  /**
   * 차단된 날짜 목록 조회
   */
  async getBlockedDates(): Promise<BlockedDate[]> {
    return this.blockedDateRepository.find({
      order: { blockedDate: 'ASC' },
    });
  }

  /**
   * 기본 영업시간 설정 초기화
   */
  async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = [
      { dayOfWeek: 0, openTime: null, closeTime: null, isHoliday: true }, // 일요일 - 휴무
      { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 월요일
      { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 화요일
      { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 수요일
      { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 목요일
      { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isHoliday: false }, // 금요일
      { dayOfWeek: 6, openTime: '09:00', closeTime: '15:00', isHoliday: false }, // 토요일 - 단축 근무
    ];

    for (const setting of defaultSettings) {
      const existing = await this.calendarSettingRepository.findOne({
        where: { dayOfWeek: setting.dayOfWeek },
      });

      if (!existing) {
        await this.calendarSettingRepository.save(
          this.calendarSettingRepository.create(setting),
        );
      }
    }
  }
}
