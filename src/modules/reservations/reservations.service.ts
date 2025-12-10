import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as moment from 'moment';
import { Reservation, ReservationStatus } from './entities';
import {
  CreateReservationDto,
  AvailableTimesDto,
  TimeType,
  ReservationsQueryDto,
} from './dto/request';
import {
  CreateReservationResponseDto,
  ReservationDetailDto,
  AvailableTimesResponseDto,
  TimeSlotDto,
  MyReservationListResponseDto,
} from './dto/response';
import { ServicesService } from '@modules/services/services.service';
import { SettingsService } from '@modules/settings/settings.service';
import { OperatingType } from '@modules/settings/entities';
import { ReservationCodeUtil } from '@common/utils/reservation-code.util';
import { ERROR_MESSAGES } from '@common/constants';

@Injectable()
export class ReservationsService {
  private readonly dayOfWeekMap = ['일', '월', '화', '수', '목', '금', '토'];
  private readonly dayCodeMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly servicesService: ServicesService,
    private readonly settingsService: SettingsService,
  ) {}

  /**
   * 예약 생성
   */
  async create(
    dto: CreateReservationDto,
    customerId: number,
  ): Promise<CreateReservationResponseDto> {
    // 서비스 존재 확인
    const service = await this.servicesService.findById(
      parseInt(dto.serviceId),
    );
    if (!service || !service.isActive) {
      throw new BadRequestException(ERROR_MESSAGES.RESERVATION.INVALID_SERVICE);
    }

    // 예약번호 생성
    const estimateDate = new Date(dto.estimateDate);
    const existingReservations = await this.reservationRepository.find({
      where: { estimateDate },
      select: ['reservationNumber'],
    });
    const nextSequence = ReservationCodeUtil.getNextSequence(
      estimateDate,
      existingReservations.map((r) => r.reservationNumber),
    );
    const reservationNumber = ReservationCodeUtil.generate(
      estimateDate,
      nextSequence,
    );

    // 예약 생성
    const reservation = this.reservationRepository.create({
      reservationNumber,
      customerId,
      serviceId: parseInt(dto.serviceId),
      estimateDate,
      estimateTime: dto.estimateTime,
      constructionDate: new Date(dto.constructionDate),
      constructionTime: dto.constructionTime || null,
      address: dto.address,
      detailAddress: dto.detailAddress,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      memo: dto.memo || null,
      photos: dto.photos || null,
      status: ReservationStatus.PENDING,
    });

    const saved = await this.reservationRepository.save(reservation);

    return {
      id: saved.id.toString(),
      reservationNumber: saved.reservationNumber,
      status: saved.status,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  /**
   * 예약 상세 조회
   */
  async findById(
    id: number,
    customerId?: number,
  ): Promise<ReservationDetailDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!reservation) {
      throw new NotFoundException(ERROR_MESSAGES.RESERVATION.NOT_FOUND);
    }

    // 고객 ID가 제공된 경우 본인 예약인지 확인
    if (customerId && reservation.customerId !== customerId) {
      throw new ForbiddenException(ERROR_MESSAGES.RESERVATION.FORBIDDEN_ACCESS);
    }

    return this.toReservationDetailDto(reservation);
  }

  /**
   * 예약 취소
   */
  async cancel(id: number, customerId: number): Promise<ReservationDetailDto> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['service'],
    });

    if (!reservation) {
      throw new NotFoundException(ERROR_MESSAGES.RESERVATION.NOT_FOUND);
    }

    if (reservation.customerId !== customerId) {
      throw new ForbiddenException(ERROR_MESSAGES.RESERVATION.FORBIDDEN_CANCEL);
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException(
        ERROR_MESSAGES.RESERVATION.ALREADY_CANCELLED,
      );
    }

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException(
        ERROR_MESSAGES.RESERVATION.CANNOT_CANCEL_COMPLETED,
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancelledAt = new Date();

    const saved = await this.reservationRepository.save(reservation);

    return this.toReservationDetailDto(saved);
  }

  /**
   * 내 예약 목록 조회
   */
  async findMyReservations(
    customerId: number,
    query: ReservationsQueryDto,
  ): Promise<MyReservationListResponseDto> {
    const whereClause: any = { customerId };

    if (query.status) {
      whereClause.status = query.status;
    }

    const [items, total] = await this.reservationRepository.findAndCount({
      where: whereClause,
      relations: ['service'],
      order: { createdAt: 'DESC' },
      take: query.limit,
      skip: query.offset,
    });

    return {
      items: items.map((r) => ({
        id: r.id.toString(),
        reservationNumber: r.reservationNumber,
        service: {
          id: r.service.id.toString(),
          title: r.service.title,
        },
        estimateDate: this.formatDate(r.estimateDate),
        status: r.status,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
    };
  }

  /**
   * 예약 가능 시간 조회
   */
  async getAvailableTimes(
    dto: AvailableTimesDto,
  ): Promise<AvailableTimesResponseDto> {
    const date = new Date(dto.date);
    const dayOfWeekIndex = date.getDay();
    const dayOfWeek = this.dayOfWeekMap[dayOfWeekIndex];

    // 휴무일 체크
    const isHoliday = await this.settingsService.isHoliday(date);
    if (isHoliday) {
      return {
        date: dto.date,
        dayOfWeek,
        isAvailable: false,
        times: [],
        defaultTime: '09:00',
      };
    }

    // 운영 설정 조회
    const operatingType =
      dto.type === TimeType.ESTIMATE
        ? OperatingType.ESTIMATE
        : OperatingType.CONSTRUCTION;
    const setting =
      await this.settingsService.getOperatingSettingByType(operatingType);

    // 기본값 설정
    const defaultSetting = {
      availableDays:
        dto.type === TimeType.ESTIMATE
          ? ['mon', 'tue', 'wed', 'thu', 'fri']
          : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      startTime: dto.type === TimeType.ESTIMATE ? '18:00' : '09:00',
      endTime: dto.type === TimeType.ESTIMATE ? '22:00' : '18:00',
      slotDuration: 60,
    };

    const config = setting || defaultSetting;

    // 요일 체크
    const dayCode = Object.keys(this.dayCodeMap).find(
      (key) => this.dayCodeMap[key] === dayOfWeekIndex,
    );
    const isOperatingDay = config.availableDays.includes(dayCode || '');

    if (!isOperatingDay) {
      return {
        date: dto.date,
        dayOfWeek,
        isAvailable: false,
        times: [],
        defaultTime: config.startTime,
      };
    }

    // 시간대 생성
    const times = this.generateTimeSlots(
      config.startTime,
      config.endTime,
      config.slotDuration,
    );

    // 해당 날짜의 기존 예약 조회
    const existingReservations = await this.reservationRepository.find({
      where:
        dto.type === TimeType.ESTIMATE
          ? { estimateDate: date }
          : { constructionDate: date },
      select:
        dto.type === TimeType.ESTIMATE
          ? ['estimateTime']
          : ['constructionTime'],
    });

    const bookedTimes = existingReservations.map((r) =>
      dto.type === TimeType.ESTIMATE ? r.estimateTime : r.constructionTime,
    );

    // 가능 여부 체크
    const timesWithAvailability: TimeSlotDto[] = times.map((time) => ({
      time,
      available: !bookedTimes.includes(time),
    }));

    return {
      date: dto.date,
      dayOfWeek,
      isAvailable: true,
      times: timesWithAvailability,
      defaultTime: config.startTime,
    };
  }

  /**
   * 시간대 생성
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number,
  ): string[] {
    const slots: string[] = [];
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');

    while (start.isBefore(end)) {
      slots.push(start.format('HH:mm'));
      start.add(slotDuration, 'minutes');
    }

    return slots;
  }

  /**
   * Reservation을 ReservationDetailDto로 변환
   */
  private toReservationDetailDto(
    reservation: Reservation,
  ): ReservationDetailDto {
    const canCancel =
      reservation.status !== ReservationStatus.CANCELLED &&
      reservation.status !== ReservationStatus.COMPLETED;

    const canReview = reservation.status === ReservationStatus.COMPLETED;

    return {
      id: reservation.id.toString(),
      reservationNumber: reservation.reservationNumber,
      service: {
        id: reservation.service.id.toString(),
        title: reservation.service.title,
      },
      estimateDate: this.formatDate(reservation.estimateDate),
      estimateTime: reservation.estimateTime,
      constructionDate: this.formatDate(reservation.constructionDate),
      constructionTime: reservation.constructionTime,
      address: reservation.address,
      detailAddress: reservation.detailAddress,
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      status: reservation.status,
      canCancel,
      canReview,
      createdAt: reservation.createdAt.toISOString(),
    };
  }

  /**
   * Date를 YYYY-MM-DD 형식으로 변환
   */
  private formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
}
