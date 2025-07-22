import { ReservationCodeUtil } from './reservation-code.util';
import * as moment from 'moment';

describe('ReservationCodeUtil', () => {
  describe('generate', () => {
    it('기본값으로 예약번호 생성', () => {
      const code = ReservationCodeUtil.generate();
      const today = moment().format('YYYYMMDD');

      expect(code).toMatch(new RegExp(`^${today}-\\d{4}$`));
      expect(code).toMatch(/^\d{8}-\d{4}$/);
    });

    it('특정 날짜와 순번으로 예약번호 생성', () => {
      const date = new Date('2024-01-15');
      const sequence = 5;

      const code = ReservationCodeUtil.generate(date, sequence);

      expect(code).toBe('20240115-0005');
    });

    it('순번이 9999를 넘어도 정상 생성', () => {
      const date = new Date('2024-12-31');
      const sequence = 10000;

      const code = ReservationCodeUtil.generate(date, sequence);

      expect(code).toBe('20241231-10000');
    });
  });

  describe('extractDate', () => {
    it('유효한 예약번호에서 날짜 추출', () => {
      const reservationCode = '20240115-0001';

      const date = ReservationCodeUtil.extractDate(reservationCode);

      expect(date).toBeInstanceOf(Date);
      expect(moment(date).format('YYYY-MM-DD')).toBe('2024-01-15');
    });

    it('잘못된 형식의 예약번호는 null 반환', () => {
      const invalidCodes = [
        'invalid-code',
        '2024011-0001',
        '20240115-001',
        '20240115_0001',
        '',
      ];

      invalidCodes.forEach((code) => {
        expect(ReservationCodeUtil.extractDate(code)).toBeNull();
      });
    });

    it('존재하지 않는 날짜는 null 반환', () => {
      const invalidDate = '20240229-0001'; // 2024년은 윤년이므로 2월 29일이 존재함
      const result = ReservationCodeUtil.extractDate(invalidDate);
      expect(result).toBeInstanceOf(Date);

      const invalidDate2 = '20230229-0001'; // 2023년은 평년이므로 2월 29일이 존재하지 않음
      const result2 = ReservationCodeUtil.extractDate(invalidDate2);
      expect(result2).toBeNull();
    });
  });

  describe('extractSequence', () => {
    it('유효한 예약번호에서 순번 추출', () => {
      const reservationCode = '20240115-0123';

      const sequence = ReservationCodeUtil.extractSequence(reservationCode);

      expect(sequence).toBe(123);
    });

    it('잘못된 형식의 예약번호는 null 반환', () => {
      const invalidCodes = [
        'invalid-code',
        '2024011-0001',
        '20240115-001',
        '20240115_0001',
        '',
      ];

      invalidCodes.forEach((code) => {
        expect(ReservationCodeUtil.extractSequence(code)).toBeNull();
      });
    });
  });

  describe('isValid', () => {
    it('유효한 예약번호 검증', () => {
      const validCodes = [
        '20240115-0001',
        '20240229-9999', // 2024년은 윤년
        '19990101-0001',
        '20991231-0001',
      ];

      validCodes.forEach((code) => {
        expect(ReservationCodeUtil.isValid(code)).toBe(true);
      });
    });

    it('잘못된 예약번호 검증', () => {
      const invalidCodes = [
        'invalid-code',
        '2024011-0001',
        '20240115-001',
        '20240115_0001',
        '20230229-0001', // 평년의 2월 29일
        '20240132-0001', // 존재하지 않는 날짜
        '20241301-0001', // 존재하지 않는 월
        '',
        null,
        undefined,
      ];

      invalidCodes.forEach((code) => {
        expect(ReservationCodeUtil.isValid(code as string)).toBe(false);
      });
    });
  });

  describe('getNextSequence', () => {
    it('기존 예약번호가 없는 경우 1 반환', () => {
      const date = new Date('2024-01-15');
      const existingCodes: string[] = [];

      const sequence = ReservationCodeUtil.getNextSequence(date, existingCodes);

      expect(sequence).toBe(1);
    });

    it('같은 날짜의 예약번호들 중 최대값 + 1 반환', () => {
      const date = new Date('2024-01-15');
      const existingCodes = [
        '20240115-0001',
        '20240115-0003',
        '20240115-0002',
        '20240114-0005', // 다른 날짜는 무시
        '20240116-0010', // 다른 날짜는 무시
      ];

      const sequence = ReservationCodeUtil.getNextSequence(date, existingCodes);

      expect(sequence).toBe(4);
    });

    it('잘못된 형식의 예약번호는 무시', () => {
      const date = new Date('2024-01-15');
      const existingCodes = [
        '20240115-0001',
        'invalid-code',
        '20240115-0002',
        '20240115_0003', // 잘못된 형식
      ];

      const sequence = ReservationCodeUtil.getNextSequence(date, existingCodes);

      expect(sequence).toBe(3);
    });
  });
});
