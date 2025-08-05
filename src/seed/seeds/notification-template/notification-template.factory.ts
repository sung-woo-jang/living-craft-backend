import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { NotificationTemplate, NotificationType, NotificationChannel } from '@modules/notifications/entities/notification-template.entity';

const NotificationTemplateFactory = localeKoSetSeederFactory(NotificationTemplate, (faker) => {
  const type = faker.helpers.arrayElement(Object.values(NotificationType));
  const channel = faker.helpers.arrayElement(Object.values(NotificationChannel));
  
  // 타입별 기본 템플릿 매핑
  const templateMap = {
    [NotificationType.RESERVATION_CONFIRMED]: {
      sms: '안녕하세요 {{customerName}}님, 예약번호 {{reservationCode}}가 확정되었습니다. 서비스일: {{serviceDate}}',
      email: {
        subject: '예약 확정 안내',
        content: `안녕하세요 {{customerName}}님,\n\n예약이 성공적으로 확정되었습니다.\n\n예약번호: {{reservationCode}}\n서비스: {{serviceName}}\n서비스일시: {{serviceDate}}\n\n감사합니다.`
      }
    },
    [NotificationType.REMINDER]: {
      sms: '{{customerName}}님, 내일 {{serviceTime}}에 {{serviceName}} 서비스가 예정되어 있습니다.',
      email: {
        subject: '서비스 일정 안내',
        content: `안녕하세요 {{customerName}}님,\n\n내일 예정된 서비스를 안내드립니다.\n\n서비스: {{serviceName}}\n일시: {{serviceDate}} {{serviceTime}}\n\n준비사항이 있으시면 미리 말씀해 주세요.`
      }
    },
    [NotificationType.QUOTE_SENT]: {
      sms: '{{customerName}}님, 요청하신 견적서가 발송되었습니다. 확인 후 연락 주세요.',
      email: {
        subject: '견적서 발송 안내',
        content: `안녕하세요 {{customerName}}님,\n\n요청하신 견적서를 발송해드립니다.\n\n견적 금액: {{quoteAmount}}원\n\n승인 또는 문의사항이 있으시면 연락 주세요.`
      }
    },
    [NotificationType.QUOTE_APPROVED]: {
      sms: '견적이 승인되었습니다. 예약번호 {{reservationCode}}로 서비스가 확정되었습니다.',
      email: {
        subject: '견적 승인 및 예약 확정',
        content: `견적 승인해주셔서 감사합니다.\n\n예약번호: {{reservationCode}}\n서비스일시: {{serviceDate}}\n\n당일 연락드리겠습니다.`
      }
    },
    [NotificationType.SERVICE_COMPLETED]: {
      sms: '{{customerName}}님, 서비스가 완료되었습니다. 이용해주셔서 감사합니다.',
      email: {
        subject: '서비스 완료 안내',
        content: `{{customerName}}님, 서비스가 성공적으로 완료되었습니다.\n\n만족스러운 서비스였기를 바라며, 다음에도 이용해주세요.\n\n감사합니다.`
      }
    },
    [NotificationType.REVIEW_REQUEST]: {
      sms: '서비스는 만족스러우셨나요? 간단한 후기를 남겨주시면 감사하겠습니다.',
      email: {
        subject: '서비스 후기 요청',
        content: `안녕하세요 {{customerName}}님,\n\n서비스 이용해주셔서 감사합니다.\n\n간단한 후기를 남겨주시면 더 나은 서비스 제공에 도움이 됩니다.\n\n후기 링크: {{reviewLink}}`
      }
    }
  };

  const template = templateMap[type];
  let subject: string | undefined;
  let content: string;

  if (channel === NotificationChannel.EMAIL && typeof template.email === 'object') {
    subject = template.email.subject;
    content = template.email.content;
  } else {
    content = template.sms;
  }

  return new NotificationTemplate({
    type,
    channel,
    subject,
    content,
    isActive: faker.datatype.boolean(0.95), // 95% 확률로 활성화
  });
});

export default NotificationTemplateFactory;