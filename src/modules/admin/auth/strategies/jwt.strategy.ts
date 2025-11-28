import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload } from '@common/interfaces';
import { UsersService } from '@modules/admin/users/users.service';
import { UserStatus } from '@common/enums';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: IJwtPayload) {
    // payload에서 사용자 ID 추출
    const user = await this.usersService.findUserByUuid(payload.sub);

    if (!user) {
      throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    // 사용자 상태 확인
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        '비활성화된 계정입니다. 관리자에게 문의하세요.',
      );
    }

    // request.user에 저장될 데이터
    return {
      sub: user.uuid,
      email: user.email,
      role: user.role,
    };
  }
}
