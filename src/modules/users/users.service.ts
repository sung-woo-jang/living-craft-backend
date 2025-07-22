import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserRole } from '@common/enums';
import { PhoneUtil } from '@common/utils/phone.util';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';
import * as bcrypt from 'bcrypt';

export interface CreateUserData {
  email?: string;
  name: string;
  phone: string;
  role: UserRole;
  naverId?: string;
  address?: string;
  marketingAgree?: boolean;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  address?: string;
  marketingAgree?: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  /**
   * 사용자 생성
   */
  async create(userData: CreateUserData): Promise<User> {
    // 이메일 중복 확인
    if (userData.email) {
      const existingUserByEmail = await this.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new ConflictException('이미 사용 중인 이메일입니다.');
      }
    }

    // 전화번호 중복 확인
    const existingUserByPhone = await this.findByPhone(userData.phone);
    if (existingUserByPhone) {
      throw new ConflictException('이미 사용 중인 전화번호입니다.');
    }

    const user = this.userRepository.create({
      ...userData,
      phone: PhoneUtil.normalizeForStorage(userData.phone),
    });

    return this.userRepository.save(user);
  }

  /**
   * ID로 사용자 조회
   */
  async findById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['reservations', 'reviews'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * 네이버 ID로 사용자 조회
   */
  async findByNaverId(naverId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { naverId },
    });
  }

  /**
   * 전화번호로 사용자 조회
   */
  async findByPhone(phone: string): Promise<User | null> {
    const normalizedPhone = PhoneUtil.normalizeForStorage(phone);
    return this.userRepository.findOne({
      where: { phone: normalizedPhone },
    });
  }

  /**
   * 사용자 목록 조회 (페이지네이션)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    users: User[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservations'],
    });

    // 전화번호 마스킹 처리
    const maskedUsers = users.map((user) => ({
      ...user,
      phone: PhoneUtil.mask(user.phone),
    }));

    const meta = new PaginationMetaDto(page, limit, total);

    return { users: maskedUsers, meta };
  }

  /**
   * 고객 목록 조회 (관리자용)
   */
  async findCustomers(paginationDto: PaginationRequestDto): Promise<{
    users: User[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [users, total] = await this.userRepository.findAndCount({
      where: { role: UserRole.CUSTOMER },
      skip,
      take: limit,
      order: { lastReservationAt: 'DESC' },
      relations: ['reservations'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { users, meta };
  }

  /**
   * 사용자 정보 수정
   */
  async update(id: number, updateData: UpdateUserData): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 전화번호 변경 시 중복 확인
    if (updateData.phone && updateData.phone !== user.phone) {
      const existingUserByPhone = await this.findByPhone(updateData.phone);
      if (existingUserByPhone && existingUserByPhone.id !== id) {
        throw new ConflictException('이미 사용 중인 전화번호입니다.');
      }
      updateData.phone = PhoneUtil.normalizeForStorage(updateData.phone);
    }

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  /**
   * 사용자 비활성화
   */
  async deactivate(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

  /**
   * 사용자 활성화
   */
  async activate(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    user.isActive = true;
    return this.userRepository.save(user);
  }

  /**
   * 사용자 예약 통계 업데이트
   */
  async updateReservationStats(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['reservations'],
    });

    if (user) {
      user.totalReservations = user.reservations.length;

      // 가장 최근 예약일 계산
      const lastReservation = user.reservations.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      )[0];

      if (lastReservation) {
        user.lastReservationAt = lastReservation.createdAt;
      }

      await this.userRepository.save(user);
    }
  }

  /**
   * 사용자 삭제 (GDPR 대응)
   */
  async remove(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 연관된 데이터 처리 필요 (예약, 리뷰 등)
    // 실제로는 소프트 딜리트나 개인정보만 마스킹하는 것이 좋음
    await this.userRepository.remove(user);
  }

  /**
   * 관리자 권한 확인
   */
  async isAdmin(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user?.role === UserRole.ADMIN || false;
  }

  /**
   * 사용자 프로필 조회
   */
  async getProfile(userId: number): Promise<UserProfile> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('프로필을 찾을 수 없습니다.');
    }

    return profile;
  }

  /**
   * 사용자 프로필 수정
   */
  async updateProfile(
    userId: number,
    updateData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const profile = await this.getProfile(userId);

    Object.assign(profile, updateData);
    return this.userProfileRepository.save(profile);
  }

  /**
   * 사용자 삭제
   */
  async delete(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    await this.userRepository.softDelete(id);
  }

  /**
   * 사용자 인증 (로그인용)
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'phone', 'role', 'isActive', 'password'],
    });

    if (!user || !user.isActive) {
      return null;
    }

    // 패스워드가 없는 경우 (OAuth 전용 사용자)
    if (!user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 패스워드 제거 후 반환
    delete user.password;
    return user;
  }
}
