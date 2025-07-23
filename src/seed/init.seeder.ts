import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AppModule } from '@/app.module';

// Seeders
import { UserSeeder } from './seeders/user.seeder';
import { ServiceSeeder } from './seeders/service.seeder';
import { CalendarSeeder } from './seeders/calendar.seeder';
import { FaqSeeder } from './seeders/faq.seeder';
import { NotificationTemplateSeeder } from './seeders/notification-template.seeder';
import { PortfolioSeeder } from './seeders/portfolio.seeder';
import { ReservationSeeder } from './seeders/reservation.seeder';
import { ReviewSeeder } from './seeders/review.seeder';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);
    const configService = app.get(ConfigService);

    console.log('🌱 Starting database seeding...');

    // 시드 데이터 실행 순서 (의존성 고려)
    const seeders = [
      UserSeeder,
      ServiceSeeder,
      CalendarSeeder,
      FaqSeeder,
      NotificationTemplateSeeder,
      PortfolioSeeder,
      ReservationSeeder, // User와 Service가 필요하므로 나중에 실행
      ReviewSeeder, // User, Service, Reservation이 필요하므로 마지막에 실행
    ];

    for (const SeederClass of seeders) {
      console.log(`📊 Running ${SeederClass.name}...`);
      const seeder = new SeederClass();
      await seeder.run(dataSource);
      console.log(`✅ ${SeederClass.name} completed`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
