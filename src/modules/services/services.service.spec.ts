import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';
import { ServiceType } from '@/common/enums';
import { Service } from './entities/service.entity';

describe('ServicesService', () => {
  let service: ServicesService;
  let repository: jest.Mocked<ServicesRepository>;

  const mockService: Service = {
    id: 1,
    name: '청소 서비스',
    description: '전문적인 청소 서비스를 제공합니다.',
    type: ServiceType.FIXED,
    price: 100000,
    duration: 120,
    isActive: true,
    displayOrder: 1,
    mainImageUrl: '/uploads/services/main.jpg',
    detailContent: '<p>상세 설명</p>',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Service;

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findActiveServices: jest.fn(),
      findByType: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      toggleActive: jest.fn(),
      updateDisplayOrder: jest.fn(),
      addImage: jest.fn(),
      removeImage: jest.fn(),
      setMainImage: jest.fn(),
      getPopularServices: jest.fn(),
      count: jest.fn(),
      countByType: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: ServicesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get(ServicesRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a service when found', async () => {
      repository.findById.mockResolvedValue(mockService);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('청소 서비스');
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create a fixed service successfully', async () => {
      const createServiceDto = {
        name: '청소 서비스',
        description: '전문적인 청소 서비스를 제공합니다.',
        type: ServiceType.FIXED,
        price: 100000,
        duration: 120,
      };

      repository.create.mockResolvedValue(mockService);

      const result = await service.create(createServiceDto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(createServiceDto);
    });

    it('should throw BadRequestException when fixed service has no price', async () => {
      const createServiceDto = {
        name: '청소 서비스',
        description: '전문적인 청소 서비스를 제공합니다.',
        type: ServiceType.FIXED,
        duration: 120,
      };

      await expect(service.create(createServiceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when custom service has price', async () => {
      const createServiceDto = {
        name: '맞춤 서비스',
        description: '맞춤형 서비스를 제공합니다.',
        type: ServiceType.CUSTOM,
        price: 100000,
        duration: 120,
      };

      await expect(service.create(createServiceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create a custom service successfully', async () => {
      const createServiceDto = {
        name: '맞춤 서비스',
        description: '맞춤형 서비스를 제공합니다.',
        type: ServiceType.CUSTOM,
        duration: 120,
      };

      const customService = {
        ...mockService,
        type: ServiceType.CUSTOM,
        price: null,
      };
      repository.create.mockResolvedValue(customService);

      const result = await service.create(createServiceDto);

      expect(result).toBeDefined();
      expect(repository.create).toHaveBeenCalledWith(createServiceDto);
    });
  });

  describe('update', () => {
    it('should update a service successfully', async () => {
      const updateServiceDto = {
        name: '수정된 청소 서비스',
        description: '수정된 설명',
      };

      const updatedService = { ...mockService, ...updateServiceDto };
      repository.findById.mockResolvedValue(mockService);
      repository.update.mockResolvedValue(updatedService);

      const result = await service.update(1, updateServiceDto);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateServiceDto);
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
    });

    it('should set price to null when changing to custom type', async () => {
      const updateServiceDto = {
        type: ServiceType.CUSTOM,
      };

      repository.findById.mockResolvedValue(mockService);
      repository.update.mockResolvedValue(mockService);

      await service.update(1, updateServiceDto);

      expect(repository.update).toHaveBeenCalledWith(1, {
        ...updateServiceDto,
        price: null,
      });
    });
  });

  describe('delete', () => {
    it('should delete service successfully', async () => {
      repository.findById.mockResolvedValue(mockService);
      repository.delete.mockResolvedValue(undefined);

      await service.delete(1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleActive', () => {
    it('should toggle service active status', async () => {
      const inactiveService = { ...mockService, isActive: false };
      repository.findById.mockResolvedValue(mockService);
      repository.toggleActive.mockResolvedValue(inactiveService);

      const result = await service.toggleActive(1);

      expect(result).toBeDefined();
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.toggleActive).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.toggleActive(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated services', async () => {
      const filter = {
        page: 1,
        limit: 10,
        skip: 0,
        take: 10,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      repository.findAll.mockResolvedValue([[mockService], 1]);

      const result = await service.findAll(filter);

      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);
      expect(repository.findAll).toHaveBeenCalledWith(filter);
    });
  });

  describe('addImage', () => {
    it('should add image to service', async () => {
      repository.findById.mockResolvedValue(mockService);
      repository.addImage.mockResolvedValue(undefined);

      await service.addImage(1, '/uploads/image.jpg', false, '설명');

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.addImage).toHaveBeenCalledWith(
        1,
        '/uploads/image.jpg',
        false,
        '설명',
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.addImage(999, '/uploads/image.jpg')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeImage', () => {
    it('should remove image from service', async () => {
      const serviceWithImages = {
        ...mockService,
        images: [{ id: 1, imageUrl: '/uploads/image.jpg' }],
      } as any;

      repository.findById.mockResolvedValue(serviceWithImages);
      repository.removeImage.mockResolvedValue(undefined);

      await service.removeImage(1, 1);

      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.removeImage).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.removeImage(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when image not found', async () => {
      const serviceWithImages = {
        ...mockService,
        images: [],
      } as any;

      repository.findById.mockResolvedValue(serviceWithImages);

      await expect(service.removeImage(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getServiceStats', () => {
    it('should return service statistics', async () => {
      repository.count.mockResolvedValue(10);
      repository.countByType.mockResolvedValueOnce(6);
      repository.countByType.mockResolvedValueOnce(4);
      repository.findActiveServices.mockResolvedValue([mockService]);

      const result = await service.getServiceStats();

      expect(result).toEqual({
        total: 10,
        fixed: 6,
        custom: 4,
        active: 1,
      });
    });
  });

  describe('isAvailableForReservation', () => {
    it('should return true when service is active', async () => {
      repository.findById.mockResolvedValue(mockService);

      const result = await service.isAvailableForReservation(1);

      expect(result).toBe(true);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should return false when service is inactive', async () => {
      const inactiveService = { ...mockService, isActive: false };
      repository.findById.mockResolvedValue(inactiveService);

      const result = await service.isAvailableForReservation(1);

      expect(result).toBe(false);
    });

    it('should return false when service not found', async () => {
      repository.findById.mockResolvedValue(null);

      const result = await service.isAvailableForReservation(999);

      expect(result).toBe(false);
    });
  });
});
