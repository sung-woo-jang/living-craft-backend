import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { UserRole } from '@common/enums';
import * as bcrypt from 'bcrypt';

export default class UserSeeder implements Seeder {
  async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const userRepository = dataSource.getRepository(User);

    // 관리자 계정이 없으면 생성
    const adminExists = await userRepository.findOne({
      where: { email: 'admin@example.com' }
    });

    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@example.com',
        name: '관리자',
        phone: '010-0000-0000',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        isActive: true,
        address: '서울시 강남구 테헤란로 123',
        marketingAgree: false,
        totalReservations: 0,
      });

      await userRepository.save(adminUser);
      console.log('✅ Admin user created: admin@example.com (password: admin123)');
    }

    // 기존 고객 수 확인
    const existingCustomersCount = await userRepository.count({
      where: { role: UserRole.CUSTOMER }
    });

    // 최소 10명의 고객이 없으면 추가 생성
    const customersToCreate = Math.max(0, 10 - existingCustomersCount);
    
    if (customersToCreate > 0) {
      await factoryManager.get(User).saveMany(customersToCreate, {
        role: UserRole.CUSTOMER
      });
      console.log(`✅ Created ${customersToCreate} customer users`);
    }

    // 추가로 3-5명의 고객 생성 (매번 실행 시)
    const additionalCustomers = await factoryManager.get(User).saveMany(
      Math.floor(Math.random() * 3) + 3, // 3-5명
      { role: UserRole.CUSTOMER }
    );
    
    console.log(`✅ Created ${additionalCustomers.length} additional customer users`);
  }
}