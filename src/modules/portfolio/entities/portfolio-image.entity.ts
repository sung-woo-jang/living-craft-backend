import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { Service } from '../../services/entities/service.entity';

@Entity('portfolio_images')
@Index(['displayOrder'])
@Index(['isActive'])
export class PortfolioImage extends BaseEntity {
  @ApiProperty({
    description: '포트폴리오 제목',
    example: '아파트 일반 청소 사례',
  })
  @Column({ length: 100 })
  title: string;

  @ApiProperty({
    description: '포트폴리오 설명',
    example: '50평 아파트 일반 청소 작업 사례입니다.',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: '시공 전 이미지',
    example: '/uploads/portfolio/before_image.jpg',
    required: false,
  })
  @Column({ nullable: true })
  beforeImage?: string;

  @ApiProperty({
    description: '시공 후 이미지',
    example: '/uploads/portfolio/after_image.jpg',
  })
  @Column()
  afterImage: string;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  @Column({ default: 0 })
  displayOrder: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Service, { nullable: true })
  @JoinColumn({ name: 'serviceId' })
  service?: Service;

  @Column({ nullable: true })
  serviceId?: number;

  constructor(partial: Partial<PortfolioImage> = {}) {
    super();
    Object.assign(this, partial);
  }
}
