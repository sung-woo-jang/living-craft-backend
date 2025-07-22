import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { OAuthAccount } from './entities/oauth-account.entity';
import { CreateUserDto } from './dto/request/create-user.dto';
import { UpdateUserDto } from './dto/request/update-user.dto';
import { PaginationRequestDto } from '@/common/dto/request/pagination-request.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(OAuthAccount)
    private readonly oauthRepository: Repository<OAuthAccount>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
      relations: ['profile'],
    });
  }

  async findByOAuth(
    provider: string,
    providerId: string,
  ): Promise<User | null> {
    const oauthAccount = await this.oauthRepository.findOne({
      where: { provider: provider as any, providerId },
      relations: ['user', 'user.profile'],
    });
    return oauthAccount?.user || null;
  }

  async findAll(pagination: PaginationRequestDto): Promise<[User[], number]> {
    const { skip, take, sortBy, sortOrder } = pagination;

    return this.userRepository.findAndCount({
      relations: ['profile'],
      skip,
      take,
      order: {
        [sortBy]: sortOrder,
      },
    });
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    const savedUser = await this.userRepository.save(user);

    // 프로필 생성
    const profile = this.profileRepository.create({
      userId: savedUser.id,
    });
    await this.profileRepository.save(profile);

    return this.findById(savedUser.id);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async updateLastLoginAt(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date(),
    });
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.softDelete(id);
  }

  async createOAuthAccount(
    userId: number,
    provider: string,
    providerId: string,
    accessToken?: string,
    refreshToken?: string,
  ): Promise<OAuthAccount> {
    const oauthAccount = this.oauthRepository.create({
      userId,
      provider: provider as any,
      providerId,
      accessToken,
      refreshToken,
    });
    return this.oauthRepository.save(oauthAccount);
  }

  async updateOAuthTokens(
    id: number,
    accessToken?: string,
    refreshToken?: string,
  ): Promise<void> {
    await this.oauthRepository.update(id, {
      accessToken,
      refreshToken,
    });
  }

  async getProfile(userId: number): Promise<UserProfile | null> {
    return this.profileRepository.findOne({
      where: { userId },
    });
  }

  async updateProfile(
    userId: number,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> {
    await this.profileRepository.update({ userId }, updates);
    return this.getProfile(userId);
  }

  async incrementReservationCount(userId: number): Promise<void> {
    await this.profileRepository.increment({ userId }, 'totalReservations', 1);
    await this.profileRepository.update(
      { userId },
      { lastReservationAt: new Date() },
    );
  }
}
