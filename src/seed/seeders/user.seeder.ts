import { DataSource } from 'typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '@common/enums';

export class UserSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    // 관리자 계정 생성
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      const admin = userRepository.create({
        email: 'admin@example.com',
        name: '관리자',
        phone: '010-0000-0000',
        role: UserRole.ADMIN,
        isActive: true,
      });

      await userRepository.save(admin);
      console.log('✅ Admin user created');
    }

    // 테스트 고객 계정들 생성
    const customers = [
      {
        email: 'customer1@example.com',
        name: '김고객',
        phone: '010-1111-1111',
        address: '서울시 강남구 테헤란로 123',
        marketingAgree: true,
      },
      {
        email: 'customer2@example.com',
        name: '이고객',
        phone: '010-2222-2222',
        address: '서울시 서초구 서초대로 456',
        marketingAgree: false,
      },
      {
        name: '박비회원', // 이메일 없는 비회원
        phone: '010-3333-3333',
        address: '서울시 송파구 올림픽로 789',
        marketingAgree: false,
      },
    ];

    for (const customerData of customers) {
      const existingCustomer = customerData.email
        ? await userRepository.findOne({ where: { email: customerData.email } })
        : await userRepository.findOne({
            where: { phone: customerData.phone },
          });

      if (!existingCustomer) {
        const customer = userRepository.create({
          ...customerData,
          role: UserRole.CUSTOMER,
          isActive: true,
        });

        await userRepository.save(customer);
        console.log(`✅ Customer created: ${customerData.name}`);
      }
    }
  }
}
