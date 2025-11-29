import { AppDataSource } from './data-source';
import { createInitialAdmin } from './initial-admin.seed';

async function runSeeds() {
  console.log('🚀 Starting database seeding...\n');

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize();

    // Seed 실행
    await createInitialAdmin();

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
