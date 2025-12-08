import { AppDataSource } from './data-source';
import { createInitialAdmin } from './initial-admin.seed';
import { createDistricts } from './districts.seed';
import { createServices } from './services.seed';
import { createOperatingSettings } from './operating-settings.seed';

async function runSeeds() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize();
    console.log('✅ Database connection established\n');

    // Seed 실행 (순서 중요)
    // 1. 관리자 계정
    await createInitialAdmin();

    // 2. 지역 데이터 (서비스 지역 설정에 필요)
    await createDistricts();

    // 3. 서비스 데이터 + 서비스 가능 지역
    await createServices();

    // 4. 운영 시간 설정
    await createOperatingSettings();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// 스크립트 실행
runSeeds();
