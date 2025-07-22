import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UserRole } from '@/common/enums';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    name: '테스트 사용자',
    phone: '01012345678',
    role: UserRole.CUSTOMER,
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as User;

  const mockProfile: UserProfile = {
    id: 1,
    userId: 1,
    address: '서울시 강남구',
    marketingAgree: false,
    totalReservations: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as UserProfile;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      updateLastLoginAt: jest.fn(),
      incrementReservationCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    const createUserDto = {
      email: 'new@example.com',
      name: '새 사용자',
      phone: '01087654321',
    };

    it('should create a user successfully', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByPhone.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(repository.findByPhone).toHaveBeenCalledWith(createUserDto.phone);
      expect(repository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });

    it('should throw ConflictException when phone already exists', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByPhone.mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(repository.findByPhone).toHaveBeenCalledWith(createUserDto.phone);
    });
  });

  describe('update', () => {
    const updateUserDto = {
      name: '수정된 이름',
      phone: '01099999999',
    };

    it('should update a user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateUserDto };
      repository.findById.mockResolvedValue(mockUser);
      repository.findByPhone.mockResolvedValue(null);
      repository.update.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateUserDto);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when phone already exists for another user', async () => {
      const anotherUser = { ...mockUser, id: 2 };
      repository.findById.mockResolvedValue(mockUser);
      repository.findByPhone.mockResolvedValue(anotherUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile when found', async () => {
      repository.getProfile.mockResolvedValue(mockProfile);

      const result = await service.getProfile(1);

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(repository.getProfile).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when profile not found', async () => {
      repository.getProfile.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto = {
      address: '부산시 해운대구',
      marketingAgree: true,
    };

    it('should update profile successfully', async () => {
      const updatedProfile = { ...mockProfile, ...updateProfileDto };
      repository.getProfile.mockResolvedValue(mockProfile);
      repository.updateProfile.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(1, updateProfileDto);

      expect(result).toBeDefined();
      expect(repository.getProfile).toHaveBeenCalledWith(1);
      expect(repository.updateProfile).toHaveBeenCalledWith(
        1,
        updateProfileDto,
      );
    });

    it('should throw NotFoundException when profile not found', async () => {
      repository.getProfile.mockResolvedValue(null);

      await expect(
        service.updateProfile(999, updateProfileDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const userWithPassword = {
        ...mockUser,
        password: '$2b$10$validhashedpassword',
      };
      repository.findByEmail.mockResolvedValue(userWithPassword);

      // bcrypt.compare를 모킹
      jest.doMock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeDefined();
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      repository.findByEmail.mockResolvedValue(inactiveUser);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toBeNull();
    });
  });
});
