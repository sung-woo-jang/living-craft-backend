import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { Service } from './service.entity';

@Entity('service_images')
export class ServiceImage extends BaseEntity {
  @ApiProperty({
    description: '이미지 URL',
    example: '/uploads/services/image.jpg',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({
    description: '메인 이미지 여부',
    example: true,
  })
  @Column({ default: false })
  isMain: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @ManyToOne(() => Service, service => service.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @Column()
  serviceId: number;

  constructor(partial: Partial<ServiceImage> = {}) {
    super();
    Object.assign(this, partial);
  }
}
