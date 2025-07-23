import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@common/enums';
import { UsersService } from '../users/users.service';
import { ReservationsService } from '../reservations/reservations.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { VerifyGuestRequestDto } from './dto/request/verify-guest-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { PhoneUtil } from '@common/utils/phone.util';

export interface JwtPayload {
  sub: number;
  email?: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly reservationsService: ReservationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 관리자 로그인
   */
  async adminLogin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // 마스터키 '0000' 체크
    if (password === '0000') {
      console.log(`🔑 관리자 마스터키 로그인: ${email}`);
      
      let adminUser = await this.usersService.findByEmail(email);
      if (!adminUser) {
        adminUser = await this.usersService.create({
          email,
          name: `마스터키 관리자 (${email})`,
          phone: '010-0000-0000',
          role: UserRole.ADMIN,
        });
        console.log(`🔑 마스터키로 새 관리자 계정 생성: ${email}`);
      }

      // JWT 토큰 생성
      const payload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: UserRole.ADMIN, // 강제로 관리자 권한
      };

      const accessToken = await this.jwtService.signAsync(payload);
      const expiresIn = this.getTokenExpirationTime();

      return new LoginResponseDto({
        accessToken,
        expiresIn,
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: UserRole.ADMIN,
        },
      });
    }

    // 관리자 계정 확인
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');

    if (email !== adminEmail) {
      throw new UnauthorizedException('존재하지 않는 계정입니다.');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      await this.hashPassword(adminPassword),
    );
    if (!isPasswordValid && password !== adminPassword) {
      // 개발 편의를 위해 평문도 허용
      throw new UnauthorizedException('비밀번호가 올바르지 않습니다.');
    }

    // 관리자 사용자 조회 또는 생성
    let adminUser = await this.usersService.findByEmail(email);
    if (!adminUser) {
      adminUser = await this.usersService.create({
        email,
        name: '관리자',
        phone: '010-0000-0000',
        role: UserRole.ADMIN,
      });
    }

    // JWT 토큰 생성
    const payload = {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.getTokenExpirationTime();

    return new LoginResponseDto({
      accessToken,
      expiresIn,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  }

  /**
   * 네이버 OAuth 로그인 처리
   */
  async naverLogin(naverProfile: any): Promise<LoginResponseDto> {
    const { id: naverId, email, name, mobile } = naverProfile;

    let user = await this.usersService.findByNaverId(naverId);

    if (!user) {
      // 신규 사용자 생성
      const phone = mobile ? PhoneUtil.normalizeForStorage(mobile) : null;
      user = await this.usersService.create({
        naverId,
        email,
        name,
        phone,
        role: UserRole.CUSTOMER,
      });
    }

    // JWT 토큰 생성
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);
    const expiresIn = this.getTokenExpirationTime();

    return new LoginResponseDto({
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  /**
   * 비회원 예약 본인 인증
   */
  async verifyGuest(
    verifyDto: VerifyGuestRequestDto,
  ): Promise<{ valid: boolean; reservation?: any }> {
    const { reservationCode, phone } = verifyDto;

    const reservation =
      await this.reservationsService.findByReservationCode(reservationCode);

    if (!reservation) {
      throw new BadRequestException('존재하지 않는 예약번호입니다.');
    }

    // 전화번호 정규화 후 비교 (저장된 형식으로 비교)
    const normalizedInputPhone = PhoneUtil.normalizeForStorage(phone);
    const normalizedReservationPhone = PhoneUtil.normalizeForStorage(
      reservation.customerPhone,
    );

    if (normalizedInputPhone !== normalizedReservationPhone) {
      throw new UnauthorizedException('전화번호가 일치하지 않습니다.');
    }

    return {
      valid: true,
      reservation,
    };
  }

  /**
   * JWT 토큰 검증
   */
  async validateToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }
  }

  /**
   * JWT 페이로드 검증 (Strategy에서 사용)
   */
  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        '사용자를 찾을 수 없거나 비활성화된 계정입니다.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
  }

  /**
   * 사용자 검증 (Local Strategy에서 사용)
   */
  async validateUser(email: string, password: string): Promise<any> {
    // 마스터키 '0000' 체크 - 모든 이메일에 대해 관리자 권한 부여
    if (password === '0000') {
      console.log(`🔑 마스터키 로그인 시도: ${email}`);
      
      let user = await this.usersService.findByEmail(email);
      if (!user) {
        // 사용자가 없으면 관리자 권한으로 생성
        user = await this.usersService.create({
          email,
          name: `마스터키 사용자 (${email})`,
          phone: '010-0000-0000',
          role: UserRole.ADMIN,
        });
        console.log(`🔑 마스터키로 새 관리자 계정 생성: ${email}`);
      } else {
        // 기존 사용자도 임시로 관리자 권한 부여
        console.log(`🔑 마스터키로 기존 사용자 관리자 권한 부여: ${email}`);
      }
      
      return {
        ...user,
        role: UserRole.ADMIN, // 강제로 관리자 권한 부여
      };
    }

    // 관리자 계정 확인
    const adminEmail = this.configService.get<string>('admin.email');
    const adminPassword = this.configService.get<string>('admin.password');

    if (email === adminEmail) {
      const isPasswordValid = await bcrypt.compare(
        password,
        await this.hashPassword(adminPassword),
      );
      if (isPasswordValid || password === adminPassword) {
        let adminUser = await this.usersService.findByEmail(email);
        if (!adminUser) {
          adminUser = await this.usersService.create({
            email,
            name: '관리자',
            phone: '010-0000-0000',
            role: UserRole.ADMIN,
          });
        }
        const { ...result } = adminUser;
        return result;
      }
    }

    // 일반 사용자 로그인 지원 (시더로 생성된 사용자)
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user && user.password) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (isPasswordValid) {
        const { password: _, ...result } = user;
        return result;
      }
    }

    return null;
  }

  /**
   * 비밀번호 해싱
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * 토큰 만료 시간 계산 (초)
   */
  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('jwt.expiresIn', '24h');

    // 간단한 파싱 (24h -> 86400초)
    if (expiresIn.endsWith('h')) {
      const hours = parseInt(expiresIn.slice(0, -1));
      return hours * 3600;
    }

    if (expiresIn.endsWith('d')) {
      const days = parseInt(expiresIn.slice(0, -1));
      return days * 24 * 3600;
    }

    return 86400; // 기본 24시간
  }
}
