import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { Review } from '@modules/reviews/entities/review.entity';

const ReviewFactory = localeKoSetSeederFactory(Review, (faker) => {
  const rating = faker.helpers.weightedArrayElement([
    { weight: 40, value: 5 }, // 40% 확률로 5점
    { weight: 30, value: 4 }, // 30% 확률로 4점
    { weight: 20, value: 3 }, // 20% 확률로 3점
    { weight: 7, value: 2 }, // 7% 확률로 2점
    { weight: 3, value: 1 }, // 3% 확률로 1점
  ]);

  // 평점별 리뷰 내용
  const reviewContents = {
    5: [
      '정말 만족스러운 서비스였습니다! 꼼꼼하게 청소해주셔서 집이 완전히 새것 같아요.',
      '친절하고 전문적인 서비스에 감동했습니다. 다음에도 꼭 이용하겠습니다.',
      '기대 이상으로 깨끗하게 해주셨어요. 시간도 정확하고 서비스 품질이 최고입니다.',
      '완벽한 청소 서비스! 구석구석 놓치는 곳 없이 깔끔하게 정리해주셨습니다.',
      '이렇게 만족스러운 청소 서비스는 처음이에요. 강력 추천합니다!',
    ],
    4: [
      '전반적으로 만족스러운 서비스였습니다. 시간도 약속대로 오셨고 깔끔하게 해주셨어요.',
      '꼼꼼하게 청소해주셔서 감사합니다. 다음에도 이용할 예정입니다.',
      '서비스 품질이 좋네요. 몇 가지 아쉬운 부분이 있지만 전체적으로 만족합니다.',
      '친절하고 깔끔하게 해주셨어요. 가격 대비 만족스러운 서비스입니다.',
      '기본적인 청소는 잘 해주셨어요. 조금 더 세심했으면 더 좋았을 것 같습니다.',
    ],
    3: [
      '보통 수준의 서비스였습니다. 기대했던 것보다는 아쉽지만 나쁘지 않았어요.',
      '시간은 정확했고 기본적인 청소는 해주셨는데, 좀 더 꼼꼼했으면 좋겠어요.',
      '가격 대비 적당한 서비스인 것 같습니다. 다음에는 더 꼼꼼히 부탁드려야겠어요.',
      '전체적으로는 괜찮았는데 몇 군데 놓친 부분이 있어서 아쉬웠습니다.',
      '서비스는 보통이었습니다. 특별히 좋지도 나쁘지도 않았어요.',
    ],
    2: [
      '기대했던 것보다 아쉬운 서비스였습니다. 몇 군데 청소가 덜 된 부분이 있어요.',
      '시간은 맞춰 오셨지만 청소 품질이 기대에 미치지 못했습니다.',
      '전체적으로 아쉬운 서비스였어요. 다음에는 더 신경써서 해주셨으면 좋겠습니다.',
      '가격에 비해 서비스 품질이 떨어지는 것 같습니다.',
      '몇 가지 놓친 부분들이 있어서 다시 청소해야 했습니다.',
    ],
    1: [
      '매우 실망스러운 서비스였습니다. 청소가 제대로 되지 않았어요.',
      '시간도 늦고 서비스 품질도 기대에 훨씬 못 미쳤습니다.',
      '다시는 이용하지 않을 것 같습니다. 너무 실망했어요.',
      '돈 아까웠습니다. 청소를 다시 해야 할 정도로 부실했어요.',
      '서비스 품질이 매우 좋지 않습니다. 개선이 필요해 보여요.',
    ],
  };

  const content = faker.helpers.arrayElement(reviewContents[rating]) as string;

  // 관리자 답글 (30% 확률)
  const adminReplies = [
    '소중한 후기 감사합니다. 더욱 만족스러운 서비스를 위해 노력하겠습니다.',
    '이용해주셔서 감사합니다. 다음에도 최선을 다하는 서비스로 찾아뵙겠습니다.',
    '만족해주셔서 감사합니다. 항상 고객 만족을 위해 최선을 다하겠습니다.',
    '피드백 감사드립니다. 더 나은 서비스 제공을 위해 지속적으로 개선하겠습니다.',
    '고객님의 소중한 의견 잘 받았습니다. 더욱 꼼꼼한 서비스로 보답하겠습니다.',
  ];

  const hasAdminReply = faker.datatype.boolean(0.3);
  const adminReply = hasAdminReply
    ? faker.helpers.arrayElement(adminReplies)
    : undefined;
  const adminReplyAt = hasAdminReply
    ? faker.date.recent({ days: 7 })
    : undefined;

  // 리뷰 이미지 (20% 확률)
  const hasImages = faker.datatype.boolean(0.2);
  const images = hasImages
    ? [
        `/uploads/reviews/review_${faker.number.int({ min: 1, max: 999 })}.jpg`,
        faker.datatype.boolean(0.5)
          ? `/uploads/reviews/review_${faker.number.int({ min: 1, max: 999 })}.jpg`
          : null,
      ].filter(Boolean)
    : undefined;

  return new Review({
    rating,
    content,
    images,
    adminReply,
    adminReplyAt,
    isActive: faker.datatype.boolean(0.95), // 95% 확률로 활성화
    userId: faker.datatype.boolean(0.8)
      ? faker.number.int({ min: 1, max: 20 })
      : undefined,
    reservationId: faker.number.int({ min: 1, max: 100 }), // 예약 ID는 시더에서 실제 값으로 설정
  });
});

export default ReviewFactory;
