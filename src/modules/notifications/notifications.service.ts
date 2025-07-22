import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
} from './entities/notification-template.entity';
import {
  NotificationLog,
  NotificationStatus,
} from './entities/notification-log.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly templateRepository: Repository<NotificationTemplate>,
    @InjectRepository(NotificationLog)
    private readonly logRepository: Repository<NotificationLog>,
  ) {}

  /**
   * 템플릿 조회
   */
  async getTemplate(
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<NotificationTemplate | null> {
    return this.templateRepository.findOne({
      where: { type, channel, isActive: true },
    });
  }

  /**
   * 알림 발송 로그 저장
   */
  async createLog(logData: Partial<NotificationLog>): Promise<NotificationLog> {
    const log = this.logRepository.create(logData);
    return this.logRepository.save(log);
  }

  /**
   * 모든 템플릿 조회
   */
  async getAllTemplates(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      order: { type: 'ASC', channel: 'ASC' },
    });
  }

  /**
   * 템플릿 업데이트
   */
  async updateTemplate(
    type: NotificationType,
    channel: NotificationChannel,
    updateData: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { type, channel },
    });

    if (template) {
      Object.assign(template, updateData);
      return this.templateRepository.save(template);
    }

    // 템플릿이 없으면 새로 생성
    const newTemplate = this.templateRepository.create({
      type,
      channel,
      ...updateData,
    });

    return this.templateRepository.save(newTemplate);
  }

  /**
   * 알림 발송 이력 조회
   */
  async getLogs(
    page = 1,
    limit = 20,
  ): Promise<{
    logs: NotificationLog[];
    total: number;
  }> {
    const [logs, total] = await this.logRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['reservation'],
    });

    return { logs, total };
  }
}
