import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@common/decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. @Public() 데코레이터 체크
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // 2. 개발 환경에서는 인증 우회
    const nodeEnv = this.configService.get<string>('NODE_ENV');
    if (nodeEnv === 'development') {
      console.log('[DEV] JwtAuthGuard bypassed for development environment');
      return true;
    }

    // 3. 프로덕션 환경에서는 정상 JWT 검증
    return super.canActivate(context);
  }
}
