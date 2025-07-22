import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
@Controller('api/auth')
@SwaggerBaseApply()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    description: '현재 세션을 종료합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(): Promise<SuccessBaseResponseDto<null>> {
    // JWT는 stateless이므로 클라이언트에서 토큰 삭제
    return new SuccessBaseResponseDto('로그아웃되었습니다.', null);
  }

  // 네이버 OAuth 관련 엔드포인트는 추후 구현
  @Get('naver')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 로그인 URL',
    description: '네이버 OAuth 인증 URL을 반환합니다.',
  })
  async getNaverAuthUrl(): Promise<SuccessBaseResponseDto<{ url: string }>> {
    // TODO: 네이버 OAuth URL 생성 로직
    const url = 'https://nid.naver.com/oauth2.0/authorize?...';
    return new SuccessBaseResponseDto('네이버 인증 URL을 반환했습니다.', {
      url,
    });
  }

  @Get('callback/naver')
  @Public()
  @ApiOperation({
    summary: '네이버 OAuth 콜백',
    description: '네이버 OAuth 인증 완료 후 콜백을 처리합니다.',
  })
  async naverCallback(
    @Request() req: any,
  ): Promise<SuccessBaseResponseDto<LoginResponseDto>> {
    // TODO: 네이버 OAuth 콜백 처리 로직
    throw new Error('네이버 OAuth 콜백 처리가 구현되지 않았습니다.');
  }
}
