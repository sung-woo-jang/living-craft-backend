import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from '@modules/reservations/entities/reservation.entity';
import { Quote } from '@modules/quotes/entities/quote.entity';
import { Review } from '@modules/reviews/entities/review.entity';
import { User } from '@modules/users/entities/user.entity';
import { Service } from '@modules/services/entities/service.entity';
import { ReservationStatus, QuoteStatus } from '@common/enums';

export interface DashboardStats {
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  totalRevenue: number;
  pendingQuotes: number;
  sentQuotes: number;
  approvedQuotes: number;
  rejectedQuotes: number;
  totalCustomers: number;
  totalReviews: number;
  averageRating: number;
}

export interface MonthlyStats {
  month: string;
  reservationsCount: number;
  revenue: number;
  completedReservations: number;
}

export interface ServiceStats {
  serviceId: number;
  serviceName: string;
  reservationsCount: number;
  revenue: number;
  averageRating: number;
  reviewsCount: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      reservationStats,
      quoteStats,
      customerCount,
      reviewStats,
      revenueResult,
    ] = await Promise.all([
      this.getReservationStats(),
      this.getQuoteStats(),
      this.getTotalCustomers(),
      this.getReviewStats(),
      this.getTotalRevenue(),
    ]);

    return {
      ...reservationStats,
      ...quoteStats,
      totalCustomers: customerCount,
      ...reviewStats,
      totalRevenue: revenueResult,
    };
  }

  async getMonthlyStats(year: number): Promise<MonthlyStats[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const monthlyData = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select([
        'EXTRACT(MONTH FROM reservation.serviceDate) as month',
        'COUNT(*) as reservationsCount',
        'SUM(CASE WHEN reservation.totalPrice IS NOT NULL THEN reservation.totalPrice ELSE 0 END) as revenue',
        'COUNT(CASE WHEN reservation.status = :completed THEN 1 END) as completedReservations',
      ])
      .where('reservation.serviceDate >= :startDate', { startDate })
      .andWhere('reservation.serviceDate < :endDate', { endDate })
      .setParameter('completed', ReservationStatus.COMPLETED)
      .groupBy('EXTRACT(MONTH FROM reservation.serviceDate)')
      .orderBy('month', 'ASC')
      .getRawMany();

    const months = [
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
      '8월',
      '9월',
      '10월',
      '11월',
      '12월',
    ];

    return months.map((monthName, index) => {
      const monthNumber = index + 1;
      const data = monthlyData.find(
        (item) => parseInt(item.month) === monthNumber,
      );

      return {
        month: monthName,
        reservationsCount: data ? parseInt(data.reservationsCount) : 0,
        revenue: data ? parseInt(data.revenue) || 0 : 0,
        completedReservations: data ? parseInt(data.completedReservations) : 0,
      };
    });
  }

  async getServiceStats(): Promise<ServiceStats[]> {
    const serviceStats = await this.serviceRepository
      .createQueryBuilder('service')
      .leftJoin('service.reservations', 'reservation')
      .leftJoin('reservation.review', 'review')
      .select([
        'service.id as serviceId',
        'service.name as serviceName',
        'COUNT(DISTINCT reservation.id) as reservationsCount',
        'SUM(CASE WHEN reservation.totalPrice IS NOT NULL THEN reservation.totalPrice ELSE 0 END) as revenue',
        'AVG(CASE WHEN review.rating IS NOT NULL THEN review.rating END) as averageRating',
        'COUNT(DISTINCT review.id) as reviewsCount',
      ])
      .groupBy('service.id, service.name')
      .orderBy('reservationsCount', 'DESC')
      .getRawMany();

    return serviceStats.map((stat) => ({
      serviceId: parseInt(stat.serviceId),
      serviceName: stat.serviceName,
      reservationsCount: parseInt(stat.reservationsCount) || 0,
      revenue: parseInt(stat.revenue) || 0,
      averageRating: stat.averageRating
        ? parseFloat(parseFloat(stat.averageRating).toFixed(1))
        : 0,
      reviewsCount: parseInt(stat.reviewsCount) || 0,
    }));
  }

  private async getReservationStats() {
    const reservationCounts = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select([
        'COUNT(*) as total',
        'COUNT(CASE WHEN status = :pending THEN 1 END) as pending',
        'COUNT(CASE WHEN status = :confirmed THEN 1 END) as confirmed',
        'COUNT(CASE WHEN status = :completed THEN 1 END) as completed',
        'COUNT(CASE WHEN status = :cancelled THEN 1 END) as cancelled',
      ])
      .setParameters({
        pending: ReservationStatus.PENDING,
        confirmed: ReservationStatus.CONFIRMED,
        completed: ReservationStatus.COMPLETED,
        cancelled: ReservationStatus.CANCELLED,
      })
      .getRawOne();

    return {
      totalReservations: parseInt(reservationCounts.total) || 0,
      pendingReservations: parseInt(reservationCounts.pending) || 0,
      confirmedReservations: parseInt(reservationCounts.confirmed) || 0,
      completedReservations: parseInt(reservationCounts.completed) || 0,
      cancelledReservations: parseInt(reservationCounts.cancelled) || 0,
    };
  }

  private async getQuoteStats() {
    const quoteCounts = await this.quoteRepository
      .createQueryBuilder('quote')
      .select([
        'COUNT(CASE WHEN status = :pending THEN 1 END) as pending',
        'COUNT(CASE WHEN status = :sent THEN 1 END) as sent',
        'COUNT(CASE WHEN status = :approved THEN 1 END) as approved',
        'COUNT(CASE WHEN status = :rejected THEN 1 END) as rejected',
      ])
      .setParameters({
        pending: QuoteStatus.PENDING,
        sent: QuoteStatus.SENT,
        approved: QuoteStatus.APPROVED,
        rejected: QuoteStatus.REJECTED,
      })
      .getRawOne();

    return {
      pendingQuotes: parseInt(quoteCounts.pending) || 0,
      sentQuotes: parseInt(quoteCounts.sent) || 0,
      approvedQuotes: parseInt(quoteCounts.approved) || 0,
      rejectedQuotes: parseInt(quoteCounts.rejected) || 0,
    };
  }

  private async getTotalCustomers(): Promise<number> {
    const customerCount = await this.userRepository.count();

    // 비회원 예약도 포함하여 고유한 전화번호 기준으로 고객 수 계산
    const uniquePhoneNumbers = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('COUNT(DISTINCT reservation.customerPhone) as uniqueCustomers')
      .getRawOne();

    const uniqueCustomerCount =
      parseInt(uniquePhoneNumbers.uniqueCustomers) || 0;

    // 회원 수와 비회원 중 더 큰 값 반환 (중복 제거를 위해)
    return Math.max(customerCount, uniqueCustomerCount);
  }

  private async getReviewStats() {
    const reviewStats = await this.reviewRepository
      .createQueryBuilder('review')
      .select(['COUNT(*) as totalReviews', 'AVG(rating) as averageRating'])
      .getRawOne();

    return {
      totalReviews: parseInt(reviewStats.totalReviews) || 0,
      averageRating: reviewStats.averageRating
        ? parseFloat(parseFloat(reviewStats.averageRating).toFixed(1))
        : 0,
    };
  }

  private async getTotalRevenue(): Promise<number> {
    const revenueResult = await this.reservationRepository
      .createQueryBuilder('reservation')
      .select('SUM(reservation.totalPrice) as totalRevenue')
      .where('reservation.totalPrice IS NOT NULL')
      .andWhere('reservation.status = :completed', {
        completed: ReservationStatus.COMPLETED,
      })
      .getRawOne();

    return parseInt(revenueResult.totalRevenue) || 0;
  }
}
