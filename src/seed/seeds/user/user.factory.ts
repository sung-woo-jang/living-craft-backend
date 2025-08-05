import { localeKoSetSeederFactory } from '../utils/localeKoSetSeederFactory';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@common/enums';
import * as bcrypt from 'bcrypt';

const UserFactory = localeKoSetSeederFactory(User, (faker) => {
  const role = faker.helpers.arrayElement([UserRole.CUSTOMER, UserRole.ADMIN]);
  const hasEmail = faker.datatype.boolean(0.8); // 80% 확률로 이메일 보유
  
  // 한국 지역명 배열
  const districts = [
    '강남구', '서초구', '송파구', '강동구', '마포구', 
    '영등포구', '용산구', '성동구', '종로구', '중구'
  ];
  
  const streets = [
    '테헤란로', '서초대로', '올림픽로', '강변북로', 
    '마포대로', '여의대로', '한강대로', '왕십리로',
    '종로', '을지로'
  ];

  return new User({
    email: hasEmail ? faker.internet.email() : undefined,
    name: faker.person.fullName(),
    phone: faker.helpers.fromRegExp(/010-[0-9]{4}-[0-9]{4}/),
    password: role === UserRole.ADMIN ? bcrypt.hashSync('admin123', 10) : 
             faker.datatype.boolean(0.3) ? bcrypt.hashSync('test123', 10) : undefined,
    role,
    isActive: faker.datatype.boolean(0.95), // 95% 확률로 활성 상태
    address: `서울시 ${faker.helpers.arrayElement(districts)} ${faker.helpers.arrayElement(streets)} ${faker.number.int({ min: 1, max: 999 })}`,
    marketingAgree: faker.datatype.boolean(0.6), // 60% 확률로 마케팅 동의
    totalReservations: faker.number.int({ min: 0, max: 20 }),
    lastReservationAt: faker.datatype.boolean(0.7) ? 
      faker.date.recent({ days: 90 }) : undefined,
    lastLoginAt: faker.datatype.boolean(0.8) ? 
      faker.date.recent({ days: 30 }) : undefined,
  });
});

export default UserFactory;