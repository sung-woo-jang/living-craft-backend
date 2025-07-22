import * as moment from 'moment';

export class ReservationCodeUtil {
  /**
   * 예약번호 생성 (YYYYMMDD-0001 형식)
   * @param date 기준 날짜 (기본값: 오늘)
   * @param sequence 순번 (기본값: 1)
   * @returns 예약번호
   */
  static generate(date: Date = new Date(), sequence: number = 1): string {
    const dateStr = moment(date).format('YYYYMMDD');
    const sequenceStr = sequence.toString().padStart(4, '0');
    return `${dateStr}-${sequenceStr}`;
  }

  /**
   * 예약번호에서 날짜 추출
   * @param reservationCode 예약번호
   * @returns 날짜 (Date 객체) 또는 null
   */
  static extractDate(reservationCode: string): Date | null {
    const match = reservationCode.match(/^(\d{8})-\d{4}$/);
    if (!match) {
      return null;
    }

    const dateStr = match[1];
    const date = moment(dateStr, 'YYYYMMDD');

    return date.isValid() ? date.toDate() : null;
  }

  /**
   * 예약번호에서 순번 추출
   * @param reservationCode 예약번호
   * @returns 순번 또는 null
   */
  static extractSequence(reservationCode: string): number | null {
    const match = reservationCode.match(/^\d{8}-(\d{4})$/);
    if (!match) {
      return null;
    }

    return parseInt(match[1], 10);
  }

  /**
   * 예약번호 유효성 검사
   * @param reservationCode 예약번호
   * @returns 유효성 여부
   */
  static isValid(reservationCode: string): boolean {
    const regex = /^\d{8}-\d{4}$/;
    if (!regex.test(reservationCode)) {
      return false;
    }

    const date = this.extractDate(reservationCode);
    return date !== null;
  }

  /**
   * 특정 날짜의 다음 순번 계산
   * @param date 기준 날짜
   * @param existingCodes 해당 날짜의 기존 예약번호 목록
   * @returns 다음 순번
   */
  static getNextSequence(date: Date, existingCodes: string[] = []): number {
    const targetDateStr = moment(date).format('YYYYMMDD');
    const todayCodes = existingCodes.filter((code) =>
      code.startsWith(targetDateStr),
    );

    if (todayCodes.length === 0) {
      return 1;
    }

    const sequences = todayCodes
      .map((code) => this.extractSequence(code))
      .filter((seq) => seq !== null) as number[];

    return Math.max(...sequences) + 1;
  }
}
