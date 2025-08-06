import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@common/enums';
import * as bcrypt from 'bcrypt';

const UserFactory = localeKoSetSeederFactory(User, (faker) => {
  const role = faker.helpers.arrayElement([UserRole.CUSTOMER, UserRole.ADMIN]);
  
  // 사용자 타입 결정
  let userType: 'admin' | 'oauth_customer' | 'regular_customer' | 'guest_customer';
  
  if (role === UserRole.ADMIN) {
    userType = 'admin';
  } else {
    // 고객의 경우 타입 분배: OAuth 30%, 일반 가입 50%, 비회원 20%
    const rand = faker.number.float({ min: 0, max: 1 });
    if (rand < 0.3) {
      userType = 'oauth_customer';
    } else if (rand < 0.8) {
      userType = 'regular_customer';
    } else {
      userType = 'guest_customer';
    }
  }

  // 한국 지역명 배열
  const districts = [
    '강남구',
    '서초구',
    '송파구',
    '강동구',
    '마포구',
    '영등포구',
    '용산구',
    '성동구',
    '종로구',
    '중구',
  ];

  const streets = [
    '테헤란로',
    '서초대로',
    '올림픽로',
    '강변북로',
    '마포대로',
    '여의대로',
    '한강대로',
    '왕십리로',
    '종로',
    '을지로',
  ];

  // 사용자 타입별 email과 password 설정
  let email: string | undefined;
  let password: string | undefined;
  let naverId: string | undefined;

  switch (userType) {
    case 'admin':
      email = faker.internet.email();
      password = bcrypt.hashSync('admin123', 10);
      break;
    case 'oauth_customer':
      email = faker.internet.email();
      password = undefined; // OAuth 사용자는 password 없음
      naverId = faker.string.alphanumeric(10); // 네이버 고유 ID
      break;
    case 'regular_customer':
      email = faker.internet.email();
      password = bcrypt.hashSync('customer123', 10);
      break;
    case 'guest_customer':
      email = undefined; // 비회원은 email 없음
      password = undefined; // 비회원은 password 없음
      break;
  }

  return new User({
    email,
    name: faker.person.fullName(),
    phone: faker.helpers.fromRegExp(/010-[0-9]{4}-[0-9]{4}/),
    password,
    role,
    isActive: faker.datatype.boolean(0.95), // 95% 확률로 활성 상태
    naverId,
    address: `서울시 ${faker.helpers.arrayElement(districts)} ${faker.helpers.arrayElement(streets)} ${faker.number.int({ min: 1, max: 999 })}`,
    marketingAgree: faker.datatype.boolean(0.6), // 60% 확률로 마케팅 동의
    totalReservations: faker.number.int({ min: 0, max: 20 }),
    lastReservationAt: faker.datatype.boolean(0.7)
      ? faker.date.recent({ days: 90 })
      : undefined,
    lastLoginAt: faker.datatype.boolean(0.8)
      ? faker.date.recent({ days: 30 })
      : undefined,
  });
});

export default UserFactory;
