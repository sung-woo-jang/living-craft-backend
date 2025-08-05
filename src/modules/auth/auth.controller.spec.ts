import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ReservationsService } from '../reservations/reservations.service';
import { LoginRequestDto } from './dto/request/login-request.dto';
import { VerifyGuestRequestDto } from './dto/request/verify-guest-request.dto';
import { UserRole } from '@common/enums';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    adminLogin: jest.fn(),
    verifyGuest: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findByNaverId: jest.fn(),
  };

  const mockReservationsService = {
    findByReservationCode: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: ReservationsService, useValue: mockReservationsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adminLogin', () => {
    it('관리자 로그인 성공', async () => {
      const loginDto: LoginRequestDto = {
        email: 'admin@example.com',
        password: 'admin123!',
      };

      const mockLoginResponse = {
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresIn: 86400,
        user: {
          id: 1,
          email: 'admin@example.com',
          name: '관리자',
          role: UserRole.ADMIN,
        },
      };

      mockAuthService.adminLogin.mockResolvedValue(mockLoginResponse);

      const result = await controller.adminLogin(loginDto);

      expect(mockAuthService.adminLogin).toHaveBeenCalledWith(loginDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockLoginResponse);
      expect(result.message).toBe('로그인되었습니다.');
    });

    it('잘못된 관리자 정보로 로그인 실패', async () => {
      const loginDto: LoginRequestDto = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.adminLogin.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(controller.adminLogin(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('verifyGuest', () => {
    it('비회원 예약 본인 인증 성공', async () => {
      const verifyDto: VerifyGuestRequestDto = {
        reservationCode: '20240101-0001',
        phone: '010-1234-5678',
      };

      const mockVerifyResponse = {
        valid: true,
        reservation: {
          id: 1,
          reservationCode: '20240101-0001',
          customerName: '홍길동',
          customerPhone: '010-1234-5678',
        },
      };

      mockAuthService.verifyGuest.mockResolvedValue(mockVerifyResponse);

      const result = await controller.verifyGuest(verifyDto);

      expect(mockAuthService.verifyGuest).toHaveBeenCalledWith(verifyDto);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockVerifyResponse);
      expect(result.message).toBe('인증되었습니다.');
    });

    it('잘못된 예약번호로 인증 실패', async () => {
      const verifyDto: VerifyGuestRequestDto = {
        reservationCode: '20240101-9999',
        phone: '010-1234-5678',
      };

      mockAuthService.verifyGuest.mockRejectedValue(
        new Error('예약을 찾을 수 없습니다'),
      );

      await expect(controller.verifyGuest(verifyDto)).rejects.toThrow(
        '예약을 찾을 수 없습니다',
      );
    });
  });

  describe('getProfile', () => {
    it('현재 사용자 정보 조회 성공', async () => {
      const mockUser = {
        sub: 1,
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      const result = await controller.getProfile(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(result.message).toBe('사용자 정보를 조회했습니다.');
    });
  });

  describe('logout', () => {
    it('로그아웃 성공', async () => {
      const mockReq = {
        user: { id: 1 },
        cookies: { refreshToken: 'test-token' },
      };
      const mockRes = {
        clearCookie: jest.fn(),
        json: jest.fn(),
      };

      await controller.logout(mockReq, mockRes);

      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(Object),
      );
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: null,
          message: '로그아웃되었습니다.',
        }),
      );
    });
  });
});
