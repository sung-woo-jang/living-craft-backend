import { Entity, Column, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@common/entities/base.entity';

@Entity('faqs')
@Index(['category', 'displayOrder'])
@Index(['isActive'])
export class Faq extends BaseEntity {
  @ApiProperty({
    description: '질문',
    example: '예약 취소는 언제까지 가능한가요?',
  })
  @Column({ type: 'text' })
  question: string;

  @ApiProperty({
    description: '답변',
    example: '서비스 예정일 1일 전까지 취소 가능합니다.',
  })
  @Column({ type: 'text' })
  answer: string;

  @ApiProperty({
    description: '카테고리',
    example: '예약/취소',
    required: false,
  })
  @Column({ nullable: true })
  category?: string;

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

  constructor(partial: Partial<Faq> = {}) {
    super();
    Object.assign(this, partial);
  }
}
