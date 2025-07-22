export class PhoneUtil {
  /**
   * 전화번호 형식 정규화 (010-1234-5678 형태로 변환)
   * @param phone 전화번호
   * @returns 정규화된 전화번호
   */
  static normalize(phone: string): string {
    // 숫자만 추출
    const digits = phone.replace(/\D/g, '');
    
    // 010으로 시작하는 휴대폰 번호 처리
    if (digits.length === 11 && digits.startsWith('010')) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    
    // 02로 시작하는 서울 지역번호 처리 (10자리)
    if (digits.length === 10 && digits.startsWith('02')) {
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    
    // 기타 지역번호 처리 (11자리)
    if (digits.length === 11 && (digits.startsWith('031') || digits.startsWith('032') || 
        digits.startsWith('033') || digits.startsWith('041') || digits.startsWith('042') || 
        digits.startsWith('043') || digits.startsWith('044') || digits.startsWith('051') || 
        digits.startsWith('052') || digits.startsWith('053') || digits.startsWith('054') || 
        digits.startsWith('055') || digits.startsWith('061') || digits.startsWith('062') || 
        digits.startsWith('063') || digits.startsWith('064'))) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    
    // 변환할 수 없는 경우 원본 반환
    return phone;
  }

  /**
   * 전화번호 유효성 검사
   * @param phone 전화번호
   * @returns 유효성 여부
   */
  static isValid(phone: string): boolean {
    const normalized = this.normalize(phone);
    
    // 정규화된 전화번호가 올바른 형식인지 확인
    const patterns = [
      /^010-\d{4}-\d{4}$/, // 휴대폰
      /^02-\d{4}-\d{4}$/,  // 서울
      /^0\d{2}-\d{4}-\d{4}$/, // 기타 지역
    ];
    
    return patterns.some(pattern => pattern.test(normalized));
  }

  /**
   * 전화번호 마스킹 (개인정보 보호)
   * @param phone 전화번호
   * @returns 마스킹된 전화번호 (예: 010-****-5678)
   */
  static mask(phone: string): string {
    const normalized = this.normalize(phone);
    
    if (normalized.match(/^010-\d{4}-\d{4}$/)) {
      return normalized.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
    }
    
    if (normalized.match(/^02-\d{4}-\d{4}$/)) {
      return normalized.replace(/(\d{2})-(\d{4})-(\d{4})/, '$1-****-$3');
    }
    
    if (normalized.match(/^0\d{2}-\d{4}-\d{4}$/)) {
      return normalized.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
    }
    
    return phone;
  }

  /**
   * 하이픈 제거
   * @param phone 전화번호
   * @returns 하이픈이 제거된 전화번호
   */
  static removeHyphen(phone: string): string {
    return phone.replace(/-/g, '');
  }
}
