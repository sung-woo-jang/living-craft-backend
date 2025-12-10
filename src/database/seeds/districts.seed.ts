import { AppDataSource } from './data-source';
import { District } from '@modules/admin/districts/entities/district.entity';
import { DistrictLevel } from '@common/enums/district-level.enum';
import districtsData from './data/districts.json';

/**
 * 전국 지역(시/도, 구/군) 데이터 생성
 * 서비스 가능 지역을 위한 전체 행정구역 데이터
 */
export async function createDistricts() {
  console.log('🗺️  Starting districts seed...');

  const districtRepository = AppDataSource.getRepository(District);

  // 기존 데이터 확인 및 삭제
  const existingCount = await districtRepository.count();
  if (existingCount > 0) {
    console.log('🗑️  Deleting existing districts...');
    // FK 제약 조건 때문에 CASCADE 사용
    await AppDataSource.query('TRUNCATE TABLE districts RESTART IDENTITY CASCADE');
  }

  // 1단계: 시/도(SIDO) 먼저 삽입
  const sidoList = districtsData.filter((d) => d.level === 'SIDO');
  const sidoMap = new Map<number, number>(); // JSON id → DB id 매핑

  console.log(`📍 Creating ${sidoList.length} SIDO...`);
  for (const sidoData of sidoList) {
    const sido = districtRepository.create({
      code: sidoData.code,
      name: sidoData.name,
      fullName: sidoData.fullName,
      level: DistrictLevel.SIDO,
      isActive: true,
      isAbandoned: false,
      parentId: null,
    });
    const saved = await districtRepository.save(sido);
    sidoMap.set(sidoData.id, saved.id);
  }

  // 2단계: 시/군/구(SIGUNGU) 삽입
  const sigunguList = districtsData.filter((d) => d.level === 'SIGUNGU');

  console.log(`📍 Creating ${sigunguList.length} SIGUNGU...`);
  for (const sigunguData of sigunguList) {
    const sigungu = districtRepository.create({
      code: sigunguData.code,
      name: sigunguData.name,
      fullName: sigunguData.fullName,
      level: DistrictLevel.SIGUNGU,
      isActive: true,
      isAbandoned: false,
      parentId: sigunguData.parent_id ? sidoMap.get(sigunguData.parent_id) : null,
    });
    await districtRepository.save(sigungu);
  }

  console.log('✅ Districts created successfully!');
  console.log(`   - 시/도: ${sidoList.length}개`);
  console.log(`   - 시/군/구: ${sigunguList.length}개`);
  console.log(`   - 총: ${districtsData.length}개`);
}
