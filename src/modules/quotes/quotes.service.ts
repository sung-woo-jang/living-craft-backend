import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { QuoteStatus, ReservationStatus } from '@common/enums';
import { CreateQuoteRequestDto } from './dto/request/create-quote-request.dto';
import { ReservationsService } from '../reservations/reservations.service';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote)
    private readonly quoteRepository: Repository<Quote>,
    private readonly reservationsService: ReservationsService,
  ) {}

  /**
   * 견적 생성/수정
   */
  async createOrUpdateQuote(
    reservationId: number,
    quoteData: CreateQuoteRequestDto,
  ): Promise<Quote> {
    // 예약 정보 확인
    const reservation = await this.reservationsService.findById(reservationId);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        '견적 대기 상태의 예약만 견적을 작성할 수 있습니다.',
      );
    }

    // 기존 견적이 있는지 확인
    let quote = await this.quoteRepository.findOne({
      where: { reservationId },
    });

    if (quote) {
      // 기존 견적 업데이트
      Object.assign(quote, {
        ...quoteData,
        quotedDate: new Date(quoteData.quotedDate),
        status: QuoteStatus.SENT,
      });
    } else {
      // 새 견적 생성
      quote = this.quoteRepository.create({
        reservationId,
        ...quoteData,
        quotedDate: new Date(quoteData.quotedDate),
        status: QuoteStatus.SENT,
      });
    }

    return this.quoteRepository.save(quote);
  }

  /**
   * 견적 목록 조회 (관리자용)
   */
  async findAll(paginationDto: PaginationRequestDto): Promise<{
    quotes: Quote[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [quotes, total] = await this.quoteRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservation', 'reservation.service'],
    });

    const meta = new PaginationMetaDto(page, limit, total);

    return { quotes, meta };
  }

  /**
   * 견적 상세 조회
   */
  async findById(id: number): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['reservation', 'reservation.service'],
    });

    if (!quote) {
      throw new NotFoundException('견적을 찾을 수 없습니다.');
    }

    return quote;
  }

  /**
   * 예약 ID로 견적 조회
   */
  async findByReservationId(reservationId: number): Promise<Quote | null> {
    return this.quoteRepository.findOne({
      where: { reservationId },
      relations: ['reservation', 'reservation.service'],
    });
  }

  /**
   * 견적 승인
   */
  async approveQuote(id: number): Promise<Quote> {
    const quote = await this.findById(id);

    if (quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException('발송된 견적만 승인할 수 있습니다.');
    }

    // 견적 승인 처리
    quote.status = QuoteStatus.APPROVED;
    await this.quoteRepository.save(quote);

    // 예약 상태를 확정으로 변경하고 가격 설정
    await this.reservationsService.updateStatus(
      quote.reservationId,
      ReservationStatus.CONFIRMED,
    );

    // 예약에 견적 가격 설정
    const reservation = await this.reservationsService.findById(
      quote.reservationId,
    );
    await this.reservationsService.update(quote.reservationId, {
      serviceDate: quote.quotedDate?.toISOString().split('T')[0],
      serviceTime: quote.quotedTime,
      // totalPrice는 별도로 설정해야 함
    });

    return this.findById(id);
  }

  /**
   * 견적 거절
   */
  async rejectQuote(id: number, reason?: string): Promise<Quote> {
    const quote = await this.findById(id);

    if (quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException('발송된 견적만 거절할 수 있습니다.');
    }

    quote.status = QuoteStatus.REJECTED;
    quote.rejectedReason = reason;

    return this.quoteRepository.save(quote);
  }

  /**
   * 대기 중인 견적 목록
   */
  async findPendingQuotes(): Promise<Quote[]> {
    return this.quoteRepository.find({
      where: { status: QuoteStatus.PENDING },
      order: { createdAt: 'ASC' },
      relations: ['reservation', 'reservation.service'],
    });
  }

  /**
   * 견적 삭제
   */
  async remove(id: number): Promise<void> {
    const quote = await this.findById(id);
    await this.quoteRepository.remove(quote);
  }

  /**
   * 견적 통계
   */
  async getQuoteStats(): Promise<{
    total: number;
    pending: number;
    sent: number;
    approved: number;
    rejected: number;
  }> {
    const [total, pending, sent, approved, rejected] = await Promise.all([
      this.quoteRepository.count(),
      this.quoteRepository.count({ where: { status: QuoteStatus.PENDING } }),
      this.quoteRepository.count({ where: { status: QuoteStatus.SENT } }),
      this.quoteRepository.count({ where: { status: QuoteStatus.APPROVED } }),
      this.quoteRepository.count({ where: { status: QuoteStatus.REJECTED } }),
    ]);

    return {
      total,
      pending,
      sent,
      approved,
      rejected,
    };
  }
}
