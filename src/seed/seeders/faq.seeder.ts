import { DataSource } from 'typeorm';
import { Faq } from '@modules/faq/entities/faq.entity';

export class FaqSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const faqRepository = dataSource.getRepository(Faq);

    const faqs = [
      {
        question: '예약 취소는 언제까지 가능한가요?',
        answer:
          '서비스 예정일 1일 전까지 취소 가능합니다. 당일 취소 시에는 취소 수수료가 발생할 수 있습니다.',
        category: '예약/취소',
        displayOrder: 1,
      },
      {
        question: '예약 변경은 어떻게 하나요?',
        answer:
          '예약번호와 전화번호로 예약 조회 후 변경하시거나, 전화로 연락주시면 변경 도와드립니다.',
        category: '예약/취소',
        displayOrder: 2,
      },
      {
        question: '서비스 시간은 어떻게 되나요?',
        answer:
          '평일 오전 9시부터 오후 6시까지, 토요일은 오전 9시부터 오후 3시까지 서비스 가능합니다. 일요일은 휴무입니다.',
        category: '서비스',
        displayOrder: 3,
      },
      {
        question: '결제는 어떻게 하나요?',
        answer:
          '서비스 완료 후 현금 또는 카드로 결제 가능합니다. 사전 결제를 원하시는 경우 계좌이체도 가능합니다.',
        category: '결제',
        displayOrder: 4,
      },
      {
        question: '청소 도구는 누가 준비하나요?',
        answer:
          '기본적인 청소 도구와 세제는 저희가 준비해서 갑니다. 특수 청소가 필요한 경우 미리 말씀해 주세요.',
        category: '서비스',
        displayOrder: 5,
      },
      {
        question: '견적은 어떻게 받을 수 있나요?',
        answer:
          '맞춤 청소나 특수 청소의 경우 현장 확인 후 견적을 드립니다. 사진으로도 대략적인 견적 확인이 가능합니다.',
        category: '견적',
        displayOrder: 6,
      },
      {
        question: '애완동물이 있어도 괜찮나요?',
        answer:
          '네, 괜찮습니다. 예약 시 미리 알려주시면 애완동물을 고려하여 안전하게 청소해드립니다.',
        category: '서비스',
        displayOrder: 7,
      },
      {
        question: '집에 없어도 청소가 가능한가요?',
        answer:
          '사전에 협의하시면 집에 안 계셔도 청소 가능합니다. 안전을 위해 귀중품은 미리 정리해 주시기 바랍니다.',
        category: '서비스',
        displayOrder: 8,
      },
    ];

    for (const faqData of faqs) {
      const existing = await faqRepository.findOne({
        where: { question: faqData.question },
      });

      if (!existing) {
        const faq = faqRepository.create(faqData);
        await faqRepository.save(faq);
        console.log(`✅ FAQ created: ${faqData.question.substring(0, 20)}...`);
      }
    }
  }
}
