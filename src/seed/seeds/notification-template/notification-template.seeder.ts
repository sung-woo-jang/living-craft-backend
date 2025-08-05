import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { NotificationTemplate, NotificationType, NotificationChannel } from '@modules/notifications/entities/notification-template.entity';

export default class NotificationTemplateSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const notificationTemplateRepository = dataSource.getRepository(NotificationTemplate);

    // 기본 알림 템플릿 데이터 (모든 타입 x 채널 조합)
    const baseTemplates = [
      // 예약 확정 SMS
      {
        type: NotificationType.RESERVATION_CONFIRMED,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '안녕하세요 {{customerName}}님, 예약번호 {{reservationCode}}가 확정되었습니다. 서비스일: {{serviceDate}}',
      },
      // 예약 확정 이메일
      {
        type: NotificationType.RESERVATION_CONFIRMED,
        channel: NotificationChannel.EMAIL,
        subject: '예약 확정 안내',
        content: `안녕하세요 {{customerName}}님,

예약이 성공적으로 확정되었습니다.

예약번호: {{reservationCode}}
서비스: {{serviceName}}
서비스일시: {{serviceDate}}

감사합니다.`,
      },
      // 알림 SMS
      {
        type: NotificationType.REMINDER,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '{{customerName}}님, 내일 {{serviceTime}}에 {{serviceName}} 서비스가 예정되어 있습니다.',
      },
      // 알림 이메일
      {
        type: NotificationType.REMINDER,
        channel: NotificationChannel.EMAIL,
        subject: '서비스 일정 안내',
        content: `안녕하세요 {{customerName}}님,

내일 예정된 서비스를 안내드립니다.

서비스: {{serviceName}}
일시: {{serviceDate}} {{serviceTime}}

준비사항이 있으시면 미리 말씀해 주세요.`,
      },
      // 견적서 발송 SMS
      {
        type: NotificationType.QUOTE_SENT,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '{{customerName}}님, 요청하신 견적서가 발송되었습니다. 확인 후 연락 주세요.',
      },
      // 견적서 발송 이메일
      {
        type: NotificationType.QUOTE_SENT,
        channel: NotificationChannel.EMAIL,
        subject: '견적서 발송 안내',
        content: `안녕하세요 {{customerName}}님,

요청하신 견적서를 발송해드립니다.

견적 금액: {{quoteAmount}}원

승인 또는 문의사항이 있으시면 연락 주세요.`,
      },
      // 견적 승인 SMS
      {
        type: NotificationType.QUOTE_APPROVED,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '견적이 승인되었습니다. 예약번호 {{reservationCode}}로 서비스가 확정되었습니다.',
      },
      // 서비스 완료 SMS
      {
        type: NotificationType.SERVICE_COMPLETED,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '{{customerName}}님, 서비스가 완료되었습니다. 이용해주셔서 감사합니다.',
      },
      // 리뷰 요청 SMS
      {
        type: NotificationType.REVIEW_REQUEST,
        channel: NotificationChannel.SMS,
        subject: null,
        content: '서비스는 만족스러우셨나요? 간단한 후기를 남겨주시면 감사하겠습니다.',
      },
    ];

    // 기본 템플릿 생성
    for (const templateData of baseTemplates) {
      const existingTemplate = await notificationTemplateRepository.findOne({
        where: { 
          type: templateData.type,
          channel: templateData.channel 
        }
      });

      if (!existingTemplate) {
        const template = new NotificationTemplate(templateData);
        await notificationTemplateRepository.save(template);
        console.log(`✅ Notification template created: ${templateData.type} - ${templateData.channel}`);
      }
    }

    // 현재 템플릿 개수 확인
    const existingTemplatesCount = await notificationTemplateRepository.count();

    // 추가 템플릿이 필요한 경우 팩토리로 생성
    const templatesToCreate = Math.max(0, 12 - existingTemplatesCount);
    
    if (templatesToCreate > 0) {
      await factoryManager.get(NotificationTemplate).saveMany(templatesToCreate);
      console.log(`✅ Created ${templatesToCreate} additional notification templates`);
    }

    console.log('✅ All notification templates are ready');
  }
}