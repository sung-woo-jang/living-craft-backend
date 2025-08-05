import { DataSource } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@common/enums';
import * as bcrypt from 'bcrypt';

export class UserSeeder {
  /**
   * 비밀번호 해싱
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private generateCustomerData(index: number) {
    const names = [
      '김고객',
      '이고객',
      '박비회원',
      '최고객',
      '정고객',
      '강고객',
      '조고객',
      '윤고객',
    ];
    const districts = [
      '강남구',
      '서초구',
      '송파구',
      '강동구',
      '마포구',
      '영등포구',
      '용산구',
      '성동구',
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
    ];

    const name = names[index % names.length];
    const phoneNumber = `010-${String(1111 + index).padStart(4, '0')}-${String(1111 + index).padStart(4, '0')}`;
    const district = districts[index % districts.length];
    const street = streets[index % streets.length];

    // 비회원 고객은 이메일 없음 (index가 2의 배수일 때)
    const hasEmail = (index + 1) % 3 !== 0;

    return {
      ...(hasEmail && { email: `customer${index + 1}@example.com` }),
      name: `${name}${index + 1}`,
      phone: phoneNumber,
      address: `서울시 ${district} ${street} ${(index + 1) * 123}`,
      marketingAgree: Math.random() > 0.5,
      // 테스트용 비밀번호 (기본: test123, 일부는 다른 패스워드)
      plainPassword:
        index % 3 === 0 ? 'admin123' : index % 2 === 0 ? 'user456' : 'test123',
    };
  }

  private async createUserIfNotExists(
    userRepository: any,
    userData: any,
    role: UserRole = UserRole.CUSTOMER,
  ): Promise<void> {
    // 이메일이 있으면 이메일로, 없으면 전화번호로 중복 체크
    const whereCondition = userData.email
      ? { email: userData.email }
      : { phone: userData.phone };

    const existing = await userRepository.findOne({ where: whereCondition });

    if (!existing) {
      // 비밀번호가 있으면 해싱 처리
      const hashedPassword = userData.plainPassword
        ? await this.hashPassword(userData.plainPassword)
        : null;

      // plainPassword는 제거하고 password 필드로 저장
      const { plainPassword, ...userDataWithoutPlainPassword } = userData;

      const user = userRepository.create({
        ...userDataWithoutPlainPassword,
        ...(hashedPassword && { password: hashedPassword }),
        role,
        isActive: true,
      });

      await userRepository.save(user);
      console.log(
        `✅ ${role} created: ${userData.name}${userData.plainPassword ? ` (password: ${userData.plainPassword})` : ''}`,
      );
    } else {
      console.log(`⚠️  ${role} already exists: ${userData.name}`);
    }
  }

  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // 관리자 계정 생성
    const adminData = {
      email: 'admin@example.com',
      name: '관리자',
      phone: '010-0000-0000',
      plainPassword: 'admin123', // 관리자 기본 비밀번호
    };

    await this.createUserIfNotExists(userRepository, adminData, UserRole.ADMIN);

    // 동적으로 고객 데이터 생성 (기본 8명, 더 많이 실행해도 중복 없이 추가)
    const existingCustomersCount = await userRepository.count({
      where: { role: UserRole.CUSTOMER },
    });

    // 최소 8명의 고객이 없으면 8명까지 생성
    const customersToCreate = Math.max(0, 8 - existingCustomersCount);

    for (
      let i = existingCustomersCount;
      i < existingCustomersCount + customersToCreate;
      i++
    ) {
      const customerData = this.generateCustomerData(i);
      await this.createUserIfNotExists(userRepository, customerData);
    }

    // 추가 고객 생성 (실행할 때마다 3명씩 더 추가)
    for (let i = 0; i < 3; i++) {
      const totalCustomers = await userRepository.count({
        where: { role: UserRole.CUSTOMER },
      });
      const newCustomerData = this.generateCustomerData(totalCustomers + i);
      await this.createUserIfNotExists(userRepository, newCustomerData);
    }
  }
}
