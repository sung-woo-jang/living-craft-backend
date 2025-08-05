import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor(private readonly configService: ConfigService) {
    // Use the namespaced configuration from naver.config.ts with fallbacks
    const naverConfig = configService.get('naver.oauth');
    const clientID =
      naverConfig?.clientId ||
      configService.get<string>('NAVER_CLIENT_ID') ||
      process.env.NAVER_CLIENT_ID ||
      'TlVTw_nfik1JB5syT8b2';
    const clientSecret =
      naverConfig?.clientSecret ||
      configService.get<string>('NAVER_CLIENT_SECRET') ||
      process.env.NAVER_CLIENT_SECRET ||
      'mVN0TjH7lD';
    const callbackURL =
      naverConfig?.callbackUrl ||
      configService.get<string>('NAVER_CALLBACK_URL') ||
      process.env.NAVER_CALLBACK_URL ||
      'http://localhost:8000/api/auth/callback/naver';

    if (!clientID || !clientSecret) {
      throw new Error(
        '네이버 OAuth 설정이 누락되었습니다. NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET 환경 변수를 확인해주세요.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, email, name, mobile } = profile._json.response;

    return {
      id,
      email,
      name,
      phone: mobile?.replace(/-/g, ''),
      provider: 'naver',
      accessToken,
      refreshToken,
    };
  }
}
