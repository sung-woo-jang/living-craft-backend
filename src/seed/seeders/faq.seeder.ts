import { DataSource } from 'typeorm';
import { Faq } from '@modules/faq/entities/faq.entity';

export class FaqSeeder {
  private generateFaqData(index: number) {
    const baseFaqs = [
      {
        question: '예약 취소는 언제까지 가능한가요?',
        answer: '서비스 예정일 1일 전까지 취소 가능합니다. 당일 취소 시에는 취소 수수료가 발생할 수 있습니다.',
        category: '예약/취소',
      },
      {
        question: '예약 변경은 어떻게 하나요?',
        answer: '예약번호와 전화번호로 예약 조회 후 변경하시거나, 전화로 연락주시면 변경 도와드립니다.',
        category: '예약/취소',
      },
      {
        question: '서비스 시간은 어떻게 되나요?',
        answer: '평일 오전 9시부터 오후 6시까지, 토요일은 오전 9시부터 오후 3시까지 서비스 가능합니다. 일요일은 휴무입니다.',
        category: '서비스',
      },
      {
        question: '결제는 어떻게 하나요?',
        answer: '서비스 완료 후 현금 또는 카드로 결제 가능합니다. 사전 결제를 원하시는 경우 계좌이체도 가능합니다.',
        category: '결제',
      },
      {
        question: '청소 도구는 누가 준비하나요?',
        answer: '기본적인 청소 도구와 세제는 저희가 준비해서 갑니다. 특수 청소가 필요한 경우 미리 말씀해 주세요.',
        category: '서비스',
      },
      {
        question: '견적은 어떻게 받을 수 있나요?',
        answer: '맞춤 청소나 특수 청소의 경우 현장 확인 후 견적을 드립니다. 사진으로도 대략적인 견적 확인이 가능합니다.',
        category: '견적',
      },
      {
        question: '애완동물이 있어도 괜찮나요?',
        answer: '네, 괜찮습니다. 예약 시 미리 알려주시면 애완동물을 고려하여 안전하게 청소해드립니다.',
        category: '서비스',
      },
      {
        question: '집에 없어도 청소가 가능한가요?',
        answer: '사전에 협의하시면 집에 안 계셔도 청소 가능합니다. 안전을 위해 귀중품은 미리 정리해 주시기 바랍니다.',
        category: '서비스',
      },
    ];

    const additionalFaqs = [
      {
        question: '주말에도 서비스가 가능한가요?',
        answer: '토요일은 오전 9시부터 오후 3시까지 서비스 가능합니다. 일요일은 휴무이며, 공휴일은 별도 문의 바랍니다.',
        category: '서비스',
      },
      {
        question: '청소 범위는 어디까지인가요?',
        answer: '일반 청소는 거실, 침실, 화장실, 주방이 기본 범위입니다. 베란다나 다락방 등 추가 공간은 별도 협의 가능합니다.',
        category: '서비스',
      },
      {
        question: '몇 시간 정도 걸리나요?',
        answer: '서비스별로 다르지만 일반 청소는 2시간, 대청소는 3시간 정도 소요됩니다. 집 상태에 따라 시간이 달라질 수 있습니다.',
        category: '서비스',
      },
      {
        question: '정기 청소 할인이 있나요?',
        answer: '월 2회 이상 정기 예약 시 10% 할인, 주 1회 정기 예약 시 15% 할인 혜택을 드립니다.',
        category: '결제',
      },
      {
        question: '손해 보상은 어떻게 되나요?',
        answer: '작업 중 발생한 손해에 대해서는 보험을 통해 보상해드립니다. 단, 고가의 물품은 사전에 말씀해 주세요.',
        category: '서비스',
      },
    ];

    const allFaqs = [...baseFaqs, ...additionalFaqs];
    const faq = allFaqs[index % allFaqs.length];
    
    // 인덱스가 기본 FAQ 범위를 초과하면 숫자 추가
    if (index >= baseFaqs.length) {
      const suffix = Math.floor(index / allFaqs.length) + 1;
      return {
        ...faq,
        question: `${faq.question} (${suffix})`,
        displayOrder: index + 1,
      };
    }
    
    return {
      ...faq,
      displayOrder: index + 1,
    };
  }

  private async createFaqIfNotExists(
    faqRepository: any,
    faqData: any,
  ): Promise<void> {
    const existing = await faqRepository.findOne({
      where: { question: faqData.question },
    });

    if (!existing) {
      const faq = faqRepository.create(faqData);
      await faqRepository.save(faq);
      console.log(`✅ FAQ created: ${faqData.question.substring(0, 30)}...`);
    } else {
      console.log(`⚠️  FAQ already exists: ${faqData.question.substring(0, 30)}...`);
    }
  }

  async run(dataSource: DataSource): Promise<void> {
    const faqRepository = dataSource.getRepository(Faq);
    
    // 기본 FAQ 8개는 항상 생성
    const existingFaqsCount = await faqRepository.count();
    const baseFaqsToCreate = Math.max(0, 8 - existingFaqsCount);
    
    for (let i = existingFaqsCount; i < existingFaqsCount + baseFaqsToCreate; i++) {
      const faqData = this.generateFaqData(i);
      await this.createFaqIfNotExists(faqRepository, faqData);
    }
    
    // 추가 FAQ 생성 (실행할 때마다 2개씩 더 추가)
    for (let i = 0; i < 2; i++) {
      const totalFaqs = await faqRepository.count();
      const newFaqData = this.generateFaqData(totalFaqs + i);
      await this.createFaqIfNotExists(faqRepository, newFaqData);
    }
  }
}