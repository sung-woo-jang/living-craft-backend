import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { VerifyGuestRequestDto } from './dto/request/verify-guest-request.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { SuccessBaseResponseDto } from '@common/dto/response/success-base-response.dto';
import { SwaggerBaseApply } from '@common/decorators/swagger-base-apply.decorator';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';

@ApiTags('인증')
@Controller('auth')
@SwaggerBaseApply()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '사용자 로그인',
    description: '이메일과 비밀번호로 사용자 로그인을 수행합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: SuccessBaseResponseDto<LoginResponseDto>,
  })
  async login(
    @Body() loginDto: LoginRequestDto,
  ): Promise<SuccessBaseResponseDto<LoginResponseDto>> {
    const result = await this.authService.login(loginDto);
    return new SuccessBaseResponseDto('로그인되었습니다.', result);
  }

  @Post('admin/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '관리자 로그인',
    description: '이메일과 비밀번호로 관리자 로그인을 수행합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: SuccessBaseResponseDto<LoginResponseDto>,
  })
  async adminLogin(
    @Body() loginDto: LoginRequestDto,
  ): Promise<SuccessBaseResponseDto<LoginResponseDto>> {
    const result = await this.authService.adminLogin(loginDto);
    return new SuccessBaseResponseDto('로그인되었습니다.', result);
  }

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '비회원 예약 본인 인증',
    description: '예약번호와 전화번호로 비회원 예약을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '인증 성공',
  })
  async verifyGuest(
    @Body() verifyDto: VerifyGuestRequestDto,
  ): Promise<SuccessBaseResponseDto<any>> {
    const result = await this.authService.verifyGuest(verifyDto);
    return new SuccessBaseResponseDto('인증되었습니다.', result);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: '토큰으로 현재 로그인된 사용자의 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
  })
  async getProfile(
    @CurrentUser() user: any,
  ): Promise<SuccessBaseResponseDto<any>> {
    return new SuccessBaseResponseDto('사용자 정보를 조회했습니다.', user);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 세션을 종료하고 쿠키를 삭제합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(@Req() req: any, @Res() res: any): Promise<void> {
    // DB에서 refresh token 무효화
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        await this.authService.revokeUserTokens(req.user?.id, 'logout');
      } catch (error) {
        console.error('로그아웃 시 refresh token 무효화 오류:', error);
      }
    }

    // HttpOnly 쿠키 삭제
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
    });
    
    // 성공 응답
    res.json(new SuccessBaseResponseDto('로그아웃되었습니다.', null));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Access Token 갱신',
    description: 'Refresh Token을 사용하여 새로운 Access Token을 발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  async refreshToken(@Req() req: any, @Res() res: any): Promise<void> {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token이 없습니다.',
        statusCode: 401,
      });
    }

    try {
      const tokens = await this.authService.refreshAccessToken(refreshToken);

      // 새 Access Token 쿠키 설정
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000, // 15분
        path: '/',
      });

      // 새 Refresh Token 쿠키 설정
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        path: '/api/auth',
      });

      res.json(new SuccessBaseResponseDto('토큰이 갱신되었습니다.', {
        message: 'Access token 갱신 성공',
      }));
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message,
        statusCode: 401,
      });
    }
  }

  @Get('naver')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 로그인 URL',
    description: '네이버 OAuth 인증 URL을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '네이버 OAuth URL 반환 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              example:
                'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=CLIENT_ID&redirect_uri=CALLBACK_URL&state=STATE',
            },
          },
        },
        message: { type: 'string', example: '네이버 인증 URL을 반환했습니다.' },
      },
    },
  })
  async getNaverAuthUrl(): Promise<SuccessBaseResponseDto<{ url: string }>> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const callbackUrl = process.env.NAVER_CALLBACK_URL || 'http://localhost:8000/api/auth/callback/naver';
    const state = this.generateState(); // CSRF 보호를 위한 state 값

    const url = new URL('https://nid.naver.com/oauth2.0/authorize');
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', callbackUrl);
    url.searchParams.append('state', state);

    return new SuccessBaseResponseDto('네이버 인증 URL을 반환했습니다.', {
      url: url.toString(),
    });
  }

  @Get('callback/naver')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 콜백',
    description: '네이버 OAuth 인증 완료 후 콜백을 처리하고 HTML 폼으로 안전하게 토큰을 전달합니다.',
  })
  @ApiQuery({
    name: 'code',
    description: '네이버에서 전달받은 인증 코드',
    required: true,
  })
  @ApiQuery({
    name: 'state',
    description: 'CSRF 보호를 위한 상태값',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '네이버 OAuth 로그인 후 HTML 폼으로 안전한 토큰 전달',
  })
  async naverCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: any,
    @Res() res: any,
    @Query('error') error?: string,
  ) {
    const frontendUrl = 'http://localhost:3000';
    
    try {
      // 에러가 있는 경우 에러 페이지로 리다이렉트
      if (error) {
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('인증 코드가 없습니다.')}`);
      }

      // 네이버 API로부터 액세스 토큰 획득
      console.log('🔑 네이버 액세스 토큰 요청 시작:', { code: code?.substring(0, 10) + '...', state });
      const accessToken = await this.getNaverAccessToken(code, state);
      console.log('✅ 네이버 액세스 토큰 획득 성공');

      // 액세스 토큰으로 사용자 정보 획득
      console.log('👤 네이버 사용자 정보 요청 시작');
      const userProfile = await this.getNaverUserProfile(accessToken);
      console.log('✅ 네이버 사용자 정보 획득 성공:', { id: userProfile.id, email: userProfile.email });

      // 사용자 로그인 처리 (클라이언트 정보 포함)
      const clientInfo = {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
      };
      const result = await this.authService.naverLogin(userProfile, clientInfo);

      // Access Token: HttpOnly 쿠키 (짧은 만료시간)
      res.cookie('accessToken', result.accessToken, {
        httpOnly: true, // XSS 방지
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만
        sameSite: 'lax', // CSRF 방지
        maxAge: 15 * 60 * 1000, // 15분
        path: '/', // 전체 경로에서 사용
      });

      // Refresh Token: HttpOnly 쿠키 (긴 만료시간)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true, // XSS 방지
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만
        sameSite: 'lax', // CSRF 방지
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
        path: '/api/auth', // refresh 엔드포인트에서만 사용
      });

      // 성공시 프론트엔드로 리다이렉트
      const redirectUrl = result.user.role === 'admin' 
        ? `${frontendUrl}/admin?loginSuccess=true` 
        : `${frontendUrl}/?loginSuccess=true`;
      
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('❌ 네이버 콜백 처리 오류:', {
        message: error.message,
        stack: error.stack,
        code,
        state,
        error: error
      });
      
      // 상세한 에러 메시지
      const errorMessage = error.message || '네이버 로그인 처리 중 오류가 발생했습니다.';
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(errorMessage)}`);
    }
  }

  /**
   * CSRF 보호를 위한 랜덤 state 값 생성
   */
  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * 네이버 OAuth 액세스 토큰 획득
   */
  private async getNaverAccessToken(
    code: string,
    state: string,
  ): Promise<string> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    const url = 'https://nid.naver.com/oauth2.0/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`네이버 토큰 요청 실패: ${response.status}`);
      }

      const tokenData = await response.json();

      if (tokenData.error) {
        throw new Error(`네이버 토큰 오류: ${tokenData.error_description}`);
      }

      return tokenData.access_token;
    } catch (error) {
      throw new BadRequestException(
        `네이버 로그인 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }

  /**
   * 네이버 사용자 프로필 정보 획득
   */
  private async getNaverUserProfile(accessToken: string): Promise<any> {
    const url = 'https://openapi.naver.com/v1/nid/me';

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`네이버 프로필 요청 실패: ${response.status}`);
      }

      const profileData = await response.json();

      if (profileData.resultcode !== '00') {
        throw new Error(`네이버 프로필 오류: ${profileData.message}`);
      }

      return profileData.response;
    } catch (error) {
      throw new BadRequestException(
        `네이버 사용자 정보 조회 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }
}
