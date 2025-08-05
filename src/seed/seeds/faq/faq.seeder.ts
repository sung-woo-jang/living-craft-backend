import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Faq } from '@modules/faq/entities/faq.entity';

export default class FaqSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const faqRepository = dataSource.getRepository(Faq);

    // 기본 FAQ 데이터
    const baseFaqs = [
      {
        question: '예약은 어떻게 하나요?',
        answer: '웹사이트에서 원하는 서비스와 날짜를 선택하여 예약하실 수 있습니다. 간단한 정보 입력 후 예약이 완료됩니다.',
        category: '예약/취소',
        displayOrder: 1,
      },
      {
        question: '예약 취소는 언제까지 가능한가요?',
        answer: '서비스 예정일 1일 전 오후 6시까지 취소 가능합니다. 당일 취소는 취소 수수료가 발생할 수 있습니다.',
        category: '예약/취소',
        displayOrder: 2,
      },
      {
        question: '서비스 시간은 얼마나 걸리나요?',
        answer: '서비스 종류에 따라 다르며, 일반 청소는 약 2-3시간, 대청소는 3-4시간 정도 소요됩니다.',
        category: '서비스/가격',
        displayOrder: 3,
      },
      {
        question: '청소용품은 누가 준비하나요?',
        answer: '모든 청소용품과 장비는 저희가 준비해서 가져갑니다. 특별한 준비는 필요하지 않습니다.',
        category: '기타',
        displayOrder: 4,
      },
      {
        question: '서비스가 만족스럽지 않으면 어떻게 하나요?',
        answer: '서비스 품질에 만족하지 않으시면 24시간 내 연락 주시면 재서비스를 제공해드립니다.',
        category: '문의/불만',
        displayOrder: 5,
      },
      {
        question: '결제 방법은 어떻게 되나요?',
        answer: '현금, 카드, 계좌이체 모두 가능합니다. 서비스 완료 후 결제하시면 됩니다.',
        category: '서비스/가격',
        displayOrder: 6,
      },
      {
        question: '서비스 지역은 어디까지인가요?',
        answer: '서울 및 경기 일부 지역에서 서비스를 제공하고 있습니다. 구체적인 지역은 예약 시 확인해주세요.',
        category: '기타',
        displayOrder: 7,
      },
      {
        question: '고객센터 운영시간은 어떻게 되나요?',
        answer: '평일 오전 9시부터 오후 6시까지 운영하며, 카카오톡 채널로도 문의 가능합니다.',
        category: '문의/불만',
        displayOrder: 8,
      },
    ];

    // 기본 FAQ 생성
    for (const faqData of baseFaqs) {
      const existingFaq = await faqRepository.findOne({
        where: { question: faqData.question }
      });

      if (!existingFaq) {
        const faq = new Faq(faqData);
        await faqRepository.save(faq);
        console.log(`✅ Base FAQ created: ${faqData.question}`);
      }
    }

    // 현재 FAQ 개수 확인
    const existingFaqsCount = await faqRepository.count();

    // 최소 15개의 FAQ가 없으면 추가 생성
    const faqsToCreate = Math.max(0, 15 - existingFaqsCount);
    
    if (faqsToCreate > 0) {
      await factoryManager.get(Faq).saveMany(faqsToCreate);
      console.log(`✅ Created ${faqsToCreate} additional FAQs`);
    }

    // 매번 실행 시 2-4개의 FAQ 추가 생성
    const additionalFaqs = await factoryManager.get(Faq).saveMany(
      Math.floor(Math.random() * 3) + 2 // 2-4개
    );
    
    console.log(`✅ Created ${additionalFaqs.length} random FAQs`);
  }
}