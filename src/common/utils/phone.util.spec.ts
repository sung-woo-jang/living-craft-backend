import { PhoneUtil } from './phone.util';

describe('PhoneUtil', () => {
  describe('normalize', () => {
    it('휴대폰 번호 정규화', () => {
      const cases = [
        ['01012345678', '010-1234-5678'],
        ['010 1234 5678', '010-1234-5678'],
        ['010.1234.5678', '010-1234-5678'],
        ['010-1234-5678', '010-1234-5678'], // 이미 정규화된 경우
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.normalize(input)).toBe(expected);
      });
    });

    it('서울 지역번호 정규화', () => {
      const cases = [
        ['0212345678', '02-1234-5678'],
        ['02 1234 5678', '02-1234-5678'],
        ['02.1234.5678', '02-1234-5678'],
        ['02-1234-5678', '02-1234-5678'],
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.normalize(input)).toBe(expected);
      });
    });

    it('기타 지역번호 정규화', () => {
      const cases = [
        ['03112345678', '031-1234-5678'], // 경기도
        ['05112345678', '051-1234-5678'], // 부산
        ['06212345678', '062-1234-5678'], // 광주
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.normalize(input)).toBe(expected);
      });
    });

    it('변환할 수 없는 형식은 원본 반환', () => {
      const cases = ['123', '010123', '1234567890123456', 'invalid-phone'];

      cases.forEach((input) => {
        expect(PhoneUtil.normalize(input)).toBe(input);
      });
    });
  });

  describe('isValid', () => {
    it('유효한 전화번호 검증', () => {
      const validNumbers = [
        '010-1234-5678',
        '02-1234-5678',
        '031-1234-5678',
        '051-1234-5678',
        '010 1234 5678', // 정규화 후 유효
        '01012345678', // 정규화 후 유효
      ];

      validNumbers.forEach((number) => {
        expect(PhoneUtil.isValid(number)).toBe(true);
      });
    });

    it('잘못된 전화번호 검증', () => {
      const invalidNumbers = [
        '010-123-5678', // 중간 번호가 3자리
        '010-12345-678', // 뒷번호가 3자리
        '02-123-5678', // 중간 번호가 3자리
        '999-1234-5678', // 존재하지 않는 지역번호
        '010-1234-567', // 뒷번호가 3자리
        '123',
        '',
        'invalid',
      ];

      invalidNumbers.forEach((number) => {
        expect(PhoneUtil.isValid(number)).toBe(false);
      });
    });
  });

  describe('mask', () => {
    it('휴대폰 번호 마스킹', () => {
      const cases = [
        ['010-1234-5678', '010-****-5678'],
        ['010 1234 5678', '010-****-5678'], // 정규화 후 마스킹
        ['01012345678', '010-****-5678'], // 정규화 후 마스킹
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.mask(input)).toBe(expected);
      });
    });

    it('서울 지역번호 마스킹', () => {
      const cases = [
        ['02-1234-5678', '02-****-5678'],
        ['02 1234 5678', '02-****-5678'],
        ['0212345678', '02-****-5678'],
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.mask(input)).toBe(expected);
      });
    });

    it('기타 지역번호 마스킹', () => {
      const cases = [
        ['031-1234-5678', '031-****-5678'],
        ['051-1234-5678', '051-****-5678'],
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.mask(input)).toBe(expected);
      });
    });

    it('마스킹할 수 없는 형식은 원본 반환', () => {
      const invalidNumbers = ['123', 'invalid', '010-123'];

      invalidNumbers.forEach((number) => {
        expect(PhoneUtil.mask(number)).toBe(number);
      });
    });
  });

  describe('removeHyphen', () => {
    it('하이픈 제거', () => {
      const cases = [
        ['010-1234-5678', '01012345678'],
        ['02-1234-5678', '0212345678'],
        ['031-1234-5678', '03112345678'],
        ['no-hyphen', 'nohyphen'],
        ['010-1234-5678-extra', '010123456789extra'],
      ];

      cases.forEach(([input, expected]) => {
        expect(PhoneUtil.removeHyphen(input)).toBe(expected);
      });
    });
  });
});
