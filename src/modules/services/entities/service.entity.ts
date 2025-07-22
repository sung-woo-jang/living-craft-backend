import { Entity, Column, OneToMany, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';
import { ServiceType } from '@common/enums';
import { Reservation } from '../../reservations/entities/reservation.entity';
import { ServiceImage } from './service-image.entity';

@Entity('services')
@Index(['isActive', 'displayOrder'])
export class Service extends BaseEntity {
  @ApiProperty({
    description: '서비스명',
    example: '일반 청소',
  })
  @Column({ length: 100 })
  name: string;

  @ApiProperty({
    description: '서비스 설명',
    example: '일반적인 집 청소 서비스입니다.',
  })
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({
    description: '서비스 타입',
    enum: ServiceType,
    example: ServiceType.FIXED,
  })
  @Column({
    type: 'enum',
    enum: ServiceType,
  })
  type: ServiceType;

  @ApiProperty({
    description: '가격 (정찰제만)',
    example: 50000,
    required: false,
  })
  @Column({ nullable: true })
  price?: number;

  @ApiProperty({
    description: '예상 소요시간 (분)',
    example: 120,
  })
  @Column()
  duration: number;

  @ApiProperty({
    description: '활성화 상태',
    example: true,
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: '표시 순서',
    example: 1,
  })
  @Column({ default: 0 })
  displayOrder: number;

  // Relations
  @OneToMany(() => Reservation, (reservation) => reservation.service)
  reservations: Reservation[];

  @OneToMany(() => ServiceImage, (image) => image.service, { cascade: true })
  images: ServiceImage[];

  constructor(partial: Partial<Service> = {}) {
    super();
    Object.assign(this, partial);
  }
}
