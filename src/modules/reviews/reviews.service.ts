import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities';
import { CreateReviewDto, ReviewsQueryDto } from './dto/request';
import {
  CreateReviewResponseDto,
  ReviewListResponseDto,
  MyReviewListResponseDto,
} from './dto/response';
import { Reservation, ReservationStatus } from '@modules/reservations/entities';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}

  /**
   * 리뷰 작성
   */
  async create(
    dto: CreateReviewDto,
    customerId: number,
  ): Promise<CreateReviewResponseDto> {
    const reservationId = parseInt(dto.reservationId);

    // 예약 조회
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
      relations: ['service'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    // 본인 예약인지 확인
    if (reservation.customerId !== customerId) {
      throw new ForbiddenException('본인의 예약에만 리뷰를 작성할 수 있습니다.');
    }

    // 완료된 예약인지 확인
    if (reservation.status !== ReservationStatus.COMPLETED) {
      throw new BadRequestException('완료된 예약에만 리뷰를 작성할 수 있습니다.');
    }

    // 이미 리뷰가 있는지 확인
    const existingReview = await this.reviewRepository.findOne({
      where: { reservationId },
    });

    if (existingReview) {
      throw new BadRequestException('이미 리뷰를 작성했습니다.');
    }

    // 리뷰 생성
    const review = this.reviewRepository.create({
      reservationId,
      customerId,
      serviceId: reservation.serviceId,
      rating: dto.rating,
      comment: dto.comment,
    });

    const saved = await this.reviewRepository.save(review);

    return {
      id: saved.id.toString(),
      rating: saved.rating,
      comment: saved.comment,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  /**
   * 리뷰 목록 조회 (공개)
   */
  async findAll(query: ReviewsQueryDto): Promise<ReviewListResponseDto> {
    const whereClause: any = {};

    if (query.rating) {
      whereClause.rating = query.rating;
    }

    if (query.serviceId) {
      whereClause.serviceId = parseInt(query.serviceId);
    }

    const [items, total] = await this.reviewRepository.findAndCount({
      where: whereClause,
      relations: ['service', 'customer'],
      order: { createdAt: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    // 평균 평점 계산
    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where(whereClause)
      .getRawOne();

    const averageRating = avgResult?.avg
      ? Math.round(parseFloat(avgResult.avg) * 10) / 10
      : undefined;

    return {
      items: items.map((review) => ({
        id: review.id.toString(),
        userName: this.maskName(review.customer?.name || '익명'),
        service: {
          id: review.service.id.toString(),
          title: review.service.title,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
      total,
      averageRating,
    };
  }

  /**
   * 내 리뷰 목록 조회
   */
  async findMyReviews(
    customerId: number,
    limit: number = 10,
    offset: number = 0,
  ): Promise<MyReviewListResponseDto> {
    const [items, total] = await this.reviewRepository.findAndCount({
      where: { customerId },
      relations: ['service'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      items: items.map((review) => ({
        id: review.id.toString(),
        service: {
          id: review.service.id.toString(),
          title: review.service.title,
        },
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * 이름 마스킹 (홍길동 -> 홍*동)
   */
  private maskName(name: string): string {
    if (!name || name.length < 2) {
      return name || '익명';
    }

    if (name.length === 2) {
      return name[0] + '*';
    }

    const first = name[0];
    const last = name[name.length - 1];
    const middle = '*'.repeat(name.length - 2);

    return first + middle + last;
  }
}
