import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReservationStatus } from '@common/enums';
import { ReservationsService } from '../reservations/reservations.service';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';

export interface CreateReviewData {
  reservationId: number;
  userId?: number;
  rating: number;
  content: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  content?: string;
  images?: string[];
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * 리뷰 작성
   */
  async create(createData: CreateReviewData): Promise<Review> {
    // 예약 정보 확인
    const reservation = await this.reservationsService.findById(
      createData.reservationId,
    );

    if (reservation.status !== ReservationStatus.COMPLETED) {
      throw new BadRequestException('완료된 예약만 리뷰를 작성할 수 있습니다.');
    }

    // 기존 리뷰가 있는지 확인
    const existingReview = await this.reviewRepository.findOne({
      where: { reservationId: createData.reservationId },
    });

    if (existingReview) {
      throw new BadRequestException('이미 리뷰가 작성된 예약입니다.');
    }

    const review = this.reviewRepository.create(createData);
    return this.reviewRepository.save(review);
  }

  /**
   * 활성화된 리뷰 목록 조회 (공개)
   */
  async findActiveReviews(paginationDto: PaginationRequestDto): Promise<{
    reviews: Review[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { isActive: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservation', 'reservation.service', 'user'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { reviews, meta };
  }

  /**
   * 모든 리뷰 목록 조회 (관리자용)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    reviews: Review[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservation', 'reservation.service', 'user'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { reviews, meta };
  }

  /**
   * 리뷰 상세 조회
   */
  async findById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['reservation', 'reservation.service', 'user'],
    });

    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    return review;
  }

  /**
   * 예약 ID로 리뷰 조회
   */
  async findByReservationId(reservationId: number): Promise<Review | null> {
    return this.reviewRepository.findOne({
      where: { reservationId },
      relations: ['reservation', 'reservation.service', 'user'],
    });
  }

  /**
   * 사용자 리뷰 목록
   */
  async findByUserId(
    userId: number,
    paginationDto: PaginationRequestDto,
  ): Promise<{
    reviews: Review[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservation', 'reservation.service'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { reviews, meta };
  }

  /**
   * 리뷰 수정
   */
  async update(id: number, updateData: UpdateReviewData): Promise<Review> {
    const review = await this.findById(id);

    Object.assign(review, updateData);
    return this.reviewRepository.save(review);
  }

  /**
   * 관리자 답글 작성
   */
  async addAdminReply(id: number, reply: string): Promise<Review> {
    const review = await this.findById(id);

    review.adminReply = reply;
    review.adminReplyAt = new Date();

    return this.reviewRepository.save(review);
  }

  /**
   * 리뷰 활성화/비활성화
   */
  async toggleActive(id: number): Promise<Review> {
    const review = await this.findById(id);
    review.isActive = !review.isActive;
    return this.reviewRepository.save(review);
  }

  /**
   * 리뷰 삭제
   */
  async remove(id: number): Promise<void> {
    const review = await this.findById(id);
    await this.reviewRepository.remove(review);
  }

  /**
   * 평점 통계
   */
  async getRatingStats(): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { [key: number]: number };
  }> {
    const reviews = await this.reviewRepository.find({
      where: { isActive: true },
      select: ['rating'],
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / totalReviews) * 10) / 10;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      ratingDistribution[review.rating]++;
    });

    return {
      averageRating,
      totalReviews,
      ratingDistribution,
    };
  }
}
