import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { Faq } from '@modules/faq/entities/faq.entity';

const FaqFactory = localeKoSetSeederFactory(Faq, (faker) => {
  // FAQ 카테고리별 질문/답변 데이터
  const faqCategories = {
    '예약/취소': [
      {
        question: '예약은 어떻게 하나요?',
        answer:
          '웹사이트에서 원하는 서비스와 날짜를 선택하여 예약하실 수 있습니다. 간단한 정보 입력 후 예약이 완료됩니다.',
      },
      {
        question: '예약 취소는 언제까지 가능한가요?',
        answer:
          '서비스 예정일 1일 전 오후 6시까지 취소 가능합니다. 당일 취소는 취소 수수료가 발생할 수 있습니다.',
      },
      {
        question: '예약 변경은 가능한가요?',
        answer:
          '네, 서비스 예정일 2일 전까지는 날짜 및 시간 변경이 가능합니다. 고객센터로 연락 주시면 도와드리겠습니다.',
      },
      {
        question: '예약 확인은 어떻게 하나요?',
        answer:
          '예약 시 발송된 예약번호로 웹사이트에서 확인하거나, 고객센터로 문의하시면 확인해드립니다.',
      },
    ],
    '서비스/가격': [
      {
        question: '서비스 시간은 얼마나 걸리나요?',
        answer:
          '서비스 종류에 따라 다르며, 일반 청소는 약 2-3시간, 대청소는 3-4시간 정도 소요됩니다.',
      },
      {
        question: '추가 요금이 발생하는 경우가 있나요?',
        answer:
          '기본 서비스 외 추가 작업이 필요한 경우 사전에 고객님께 안내 후 진행하며, 동의 없이는 추가 요금이 발생하지 않습니다.',
      },
      {
        question: '견적은 어떻게 받을 수 있나요?',
        answer:
          '맞춤 서비스의 경우 현장 확인 후 정확한 견적을 제공해드립니다. 웹사이트에서 견적 요청을 해주세요.',
      },
      {
        question: '결제 방법은 어떻게 되나요?',
        answer:
          '현금, 카드, 계좌이체 모두 가능합니다. 서비스 완료 후 결제하시면 됩니다.',
      },
    ],
    기타: [
      {
        question: '서비스 지역은 어디까지인가요?',
        answer:
          '서울 및 경기 일부 지역에서 서비스를 제공하고 있습니다. 구체적인 지역은 예약 시 확인해주세요.',
      },
      {
        question: '청소용품은 누가 준비하나요?',
        answer:
          '모든 청소용품과 장비는 저희가 준비해서 가져갑니다. 특별한 준비는 필요하지 않습니다.',
      },
      {
        question: '애완동물이 있어도 괜찮나요?',
        answer:
          '네, 괜찮습니다. 다만 예약 시 미리 알려주시면 더욱 안전하게 서비스를 제공할 수 있습니다.',
      },
      {
        question: '정기 서비스도 가능한가요?',
        answer:
          '네, 주 1회, 월 2회 등 정기 서비스도 제공합니다. 정기 서비스는 할인 혜택이 있습니다.',
      },
    ],
    '문의/불만': [
      {
        question: '서비스가 만족스럽지 않으면 어떻게 하나요?',
        answer:
          '서비스 품질에 만족하지 않으시면 24시간 내 연락 주시면 재서비스를 제공해드립니다.',
      },
      {
        question: '고객센터 운영시간은 어떻게 되나요?',
        answer:
          '평일 오전 9시부터 오후 6시까지 운영하며, 카카오톡 채널로도 문의 가능합니다.',
      },
      {
        question: '피드백은 어떻게 남길 수 있나요?',
        answer:
          '서비스 완료 후 문자로 발송되는 링크를 통해 리뷰를 남겨주시면 됩니다.',
      },
    ],
  };

  const categories = Object.keys(faqCategories) as (keyof typeof faqCategories)[];
  const selectedCategory = faker.helpers.arrayElement(categories);
  const faqData = faker.helpers.arrayElement(faqCategories[selectedCategory]);

  return new Faq({
    question: faqData.question,
    answer: faqData.answer,
    category: selectedCategory,
    displayOrder: faker.number.int({ min: 1, max: 100 }),
    isActive: faker.datatype.boolean(0.95), // 95% 확률로 활성화
  });
});

export default FaqFactory;
