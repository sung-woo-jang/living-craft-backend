import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '@modules/admin/users/users.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { IJwtPayload } from '@common/interfaces';
import { UserStatus } from '@common/enums';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '@modules/admin/users/dto/response/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // 로그인
  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    // 이메일로 사용자 조회
    const user = await this.usersService.findUserByEmail(dto.email);

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 사용자 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        '비활성화된 계정입니다. 관리자에게 문의하세요.',
      );
    }

    // JWT 페이로드 생성
    const payload: IJwtPayload = {
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };

    // JWT 토큰 생성
    const accessToken = this.jwtService.sign(payload);

    // 마지막 로그인 시간 업데이트
    await this.usersService.updateLastLogin(user.id);

    // 응답 데이터 구성
    const userResponse = plainToInstance(UserResponseDto, user);
    return {
      accessToken,
      user: userResponse,
    };
  }

  // 현재 사용자 조회 (JWT 검증 후)
  async getCurrentUser(uuid: string): Promise<UserResponseDto> {
    const user = await this.usersService.findUserByUuid(uuid);
    return plainToInstance(UserResponseDto, user);
  }
}
