import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationStatus, ServiceType } from '@common/enums';
import { CreateReservationRequestDto } from './dto/request/create-reservation-request.dto';
import { ServicesService } from '../services/services.service';
import { UsersService } from '../users/users.service';
import { CalendarService } from '../calendar/calendar.service';
import { ReservationCodeUtil } from '@common/utils/reservation-code.util';
import { PhoneUtil } from '@common/utils/phone.util';
import { PaginationRequestDto } from '@common/dto/request/pagination-request.dto';
import { PaginationMetaDto } from '@common/dto/response/success-base-response.dto';
import * as moment from 'moment';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
    private readonly calendarService: CalendarService,
  ) {}

  /**
   * 예약 생성
   */
  async create(
    createDto: CreateReservationRequestDto,
    userId?: number,
  ): Promise<Reservation> {
    const service = await this.servicesService.findById(createDto.serviceId);

    // 서비스 활성화 상태 확인
    if (!service.isActive) {
      throw new BadRequestException('비활성화된 서비스입니다.');
    }

    // 예약 가능한 날짜/시간인지 확인
    const isAvailable = await this.calendarService.isAvailable(
      new Date(createDto.serviceDate),
      createDto.serviceTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('선택한 날짜/시간에는 예약할 수 없습니다.');
    }

    // 예약번호 생성
    const serviceDate = new Date(createDto.serviceDate);
    const existingCodes = await this.getTodayReservationCodes(serviceDate);
    const sequence = ReservationCodeUtil.getNextSequence(
      serviceDate,
      existingCodes,
    );
    const reservationCode = ReservationCodeUtil.generate(serviceDate, sequence);

    // 예약 데이터 생성
    const reservationData: Partial<Reservation> = {
      reservationCode,
      serviceId: createDto.serviceId,
      customerName: createDto.customerName,
      customerPhone: PhoneUtil.normalizeForStorage(createDto.customerPhone),
      customerEmail: createDto.customerEmail,
      serviceAddress: createDto.serviceAddress,
      serviceDate: new Date(createDto.serviceDate),
      serviceTime: createDto.serviceTime,
      requestNote: createDto.requestNote,
      userId,
    };

    // 서비스 타입에 따른 초기 상태 및 가격 설정
    if (service.type === ServiceType.FIXED) {
      // 정찰제: 즉시 확정, 가격 설정
      reservationData.status = ReservationStatus.CONFIRMED;
      reservationData.totalPrice = service.price;
    } else {
      // 견적제: 견적 대기 상태
      reservationData.status = ReservationStatus.PENDING;
    }

    const reservation = this.reservationRepository.create(reservationData);
    const savedReservation = await this.reservationRepository.save(reservation);

    // 사용자 통계 업데이트
    if (userId) {
      await this.usersService.updateReservationStats(userId);
    }

    return this.findById(savedReservation.id);
  }

  /**
   * 예약번호로 조회
   */
  async findByReservationCode(reservationCode: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { reservationCode },
      relations: ['service', 'service.images', 'user', 'quote', 'review'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    // 전화번호 마스킹
    reservation.customerPhone = PhoneUtil.mask(reservation.customerPhone);

    return reservation;
  }

  /**
   * ID로 예약 조회
   */
  async findById(id: number): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['service', 'service.images', 'user', 'quote', 'review'],
    });

    if (!reservation) {
      throw new NotFoundException('예약을 찾을 수 없습니다.');
    }

    return reservation;
  }

  /**
   * 예약 목록 조회 (관리자용)
   */
  async findAll(
    paginationDto: PaginationRequestDto,
    status?: ReservationStatus,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    reservations: Reservation[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const queryBuilder = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.service', 'service')
      .leftJoinAndSelect('reservation.user', 'user')
      .leftJoinAndSelect('reservation.quote', 'quote');

    // 상태 필터
    if (status) {
      queryBuilder.andWhere('reservation.status = :status', { status });
    }

    // 날짜 필터
    if (startDate) {
      queryBuilder.andWhere('reservation.serviceDate >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('reservation.serviceDate <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('reservation.serviceDate', 'DESC')
      .addOrderBy('reservation.serviceTime', 'ASC')
      .skip(skip)
      .take(limit);

    const [reservations, total] = await queryBuilder.getManyAndCount();

    const meta = new PaginationMetaDto(page, limit, total);

    return { reservations, meta };
  }

  /**
   * 사용자의 예약 목록 조회
   */
  async findByUserId(
    userId: number,
    paginationDto: PaginationRequestDto,
  ): Promise<{
    reservations: Reservation[];
    meta: PaginationMetaDto;
  }> {
    const { page, limit, skip } = paginationDto;

    const [reservations, total] = await this.reservationRepository.findAndCount(
      {
        where: { userId },
        skip,
        take: limit,
        order: { serviceDate: 'DESC', serviceTime: 'ASC' },
        relations: ['service', 'service.images', 'quote', 'review'],
      },
    );

    const meta = new PaginationMetaDto(page, limit, total);

    return { reservations, meta };
  }

  /**
   * 오늘의 예약 목록
   */
  async findTodayReservations(): Promise<Reservation[]> {
    const today = moment().format('YYYY-MM-DD');

    return this.reservationRepository.find({
      where: { serviceDate: new Date(today) },
      order: { serviceTime: 'ASC' },
      relations: ['service', 'user'],
    });
  }

  /**
   * 예약 상태 변경
   */
  async updateStatus(
    id: number,
    status: ReservationStatus,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);
    reservation.status = status;

    await this.reservationRepository.save(reservation);
    return this.findById(id);
  }

  /**
   * 예약 수정
   */
  async update(
    id: number,
    updateData: Partial<CreateReservationRequestDto>,
  ): Promise<Reservation> {
    const reservation = await this.findById(id);

    // 날짜/시간 변경 시 가용성 확인
    if (updateData.serviceDate || updateData.serviceTime) {
      const serviceDate = updateData.serviceDate
        ? new Date(updateData.serviceDate)
        : reservation.serviceDate;
      const serviceTime = updateData.serviceTime || reservation.serviceTime;

      const isAvailable = await this.calendarService.isAvailable(
        serviceDate,
        serviceTime,
      );
      if (!isAvailable) {
        throw new BadRequestException(
          '선택한 날짜/시간에는 예약할 수 없습니다.',
        );
      }
    }

    // 전화번호 정규화
    if (updateData.customerPhone) {
      updateData.customerPhone = PhoneUtil.normalizeForStorage(
        updateData.customerPhone,
      );
    }

    Object.assign(reservation, updateData);
    await this.reservationRepository.save(reservation);

    return this.findById(id);
  }

  /**
   * 예약 취소
   */
  async cancel(id: number, reason?: string): Promise<Reservation> {
    const reservation = await this.findById(id);

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException('완료된 예약은 취소할 수 없습니다.');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('이미 취소된 예약입니다.');
    }

    reservation.status = ReservationStatus.CANCELLED;
    if (reason) {
      reservation.requestNote = `[취소사유] ${reason}${reservation.requestNote ? `\n\n[기존메모] ${reservation.requestNote}` : ''}`;
    }

    await this.reservationRepository.save(reservation);
    return this.findById(id);
  }

  /**
   * 특정 날짜의 예약번호 목록 조회
   */
  private async getTodayReservationCodes(date: Date): Promise<string[]> {
    const dateStr = moment(date).format('YYYY-MM-DD');
    const reservations = await this.reservationRepository.find({
      select: ['reservationCode'],
      where: { serviceDate: new Date(dateStr) },
    });

    return reservations.map((r) => r.reservationCode);
  }

  /**
   * 예약 삭제 (관리자만)
   */
  async remove(id: number): Promise<void> {
    const reservation = await this.findById(id);
    await this.reservationRepository.remove(reservation);
  }
}
