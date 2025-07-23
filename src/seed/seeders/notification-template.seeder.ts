import { DataSource } from 'typeorm';
import {
  NotificationTemplate,
  NotificationType,
  NotificationChannel,
} from '@modules/notifications/entities/notification-template.entity';

export class NotificationTemplateSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const templateRepository = dataSource.getRepository(NotificationTemplate);

    const templates = [
      // SMS 템플릿
      {
        type: NotificationType.RESERVATION_CONFIRMED,
        channel: NotificationChannel.SMS,
        subject: null,
        content:
          '안녕하세요 {{customerName}}님, 예약번호 {{reservationCode}}가 확정되었습니다. 서비스일: {{serviceDate}} {{serviceTime}}',
      },
      {
        type: NotificationType.REMINDER,
        channel: NotificationChannel.SMS,
        subject: null,
        content:
          '{{customerName}}님, 내일({{serviceDate}} {{serviceTime}}) 예약된 {{serviceName}} 서비스 예정입니다. 문의: 010-0000-0000',
      },
      {
        type: NotificationType.QUOTE_SENT,
        channel: NotificationChannel.SMS,
        subject: null,
        content:
          '{{customerName}}님, 예약번호 {{reservationCode}}의 견적서가 발송되었습니다. 예약 조회에서 확인해 주세요.',
      },
      {
        type: NotificationType.SERVICE_COMPLETED,
        channel: NotificationChannel.SMS,
        subject: null,
        content:
          '{{customerName}}님, {{serviceName}} 서비스가 완료되었습니다. 리뷰 작성 부탁드립니다. 감사합니다!',
      },

      // 이메일 템플릿
      {
        type: NotificationType.RESERVATION_CONFIRMED,
        channel: NotificationChannel.EMAIL,
        subject: '[{{serviceName}}] 예약이 확정되었습니다',
        content: `안녕하세요 {{customerName}}님,

예약해주신 서비스가 확정되었습니다.

■ 예약 정보
- 예약번호: {{reservationCode}}
- 서비스: {{serviceName}}
- 일시: {{serviceDate}} {{serviceTime}}
- 주소: {{serviceAddress}}
- 가격: {{totalPrice}}원

서비스 당일에 성심껏 서비스 해드리겠습니다.
문의사항이 있으시면 언제든 연락주세요.

감사합니다.`,
      },
      {
        type: NotificationType.QUOTE_SENT,
        channel: NotificationChannel.EMAIL,
        subject: '[견적서] {{serviceName}} 견적서가 발송되었습니다',
        content: `안녕하세요 {{customerName}}님,

요청해주신 서비스의 견적서를 발송해드립니다.

■ 견적 정보
- 예약번호: {{reservationCode}}
- 서비스: {{serviceName}}
- 견적 가격: {{quotedPrice}}원
- 예상 소요시간: {{quotedDuration}}분
- 제안 일시: {{quotedDate}} {{quotedTime}}

견적서를 확인하시고 승인해 주시면 예약이 확정됩니다.
예약번호로 조회하여 견적서를 확인해 주세요.

감사합니다.`,
      },
    ];

    for (const templateData of templates) {
      const existing = await templateRepository.findOne({
        where: {
          type: templateData.type,
          channel: templateData.channel,
        },
      });

      if (!existing) {
        const template = templateRepository.create(templateData);
        await templateRepository.save(template);
        console.log(
          `✅ Notification template created: ${templateData.type} (${templateData.channel})`,
        );
      }
    }
  }
}
