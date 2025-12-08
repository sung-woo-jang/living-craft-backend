import { AppDataSource } from './data-source';
import { District } from '@modules/admin/districts/entities/district.entity';
import { DistrictLevel } from '@common/enums/district-level.enum';

/**
 * 기본 지역(시/도, 구/군) 데이터 생성
 * 서비스 가능 지역을 위한 기본 지역 데이터
 */
export async function createDistricts() {
  console.log('🗺️  Starting districts seed...');

  const districtRepository = AppDataSource.getRepository(District);

  // 기존 데이터 확인
  const existingCount = await districtRepository.count();
  if (existingCount > 0) {
    console.log('ℹ️  Districts already exist. Skipping...');
    return;
  }

  // 시/도 데이터
  const sidoData = [
    { code: '1100000000', name: '서울특별시', fullName: '서울특별시' },
    { code: '4100000000', name: '경기도', fullName: '경기도' },
    { code: '2300000000', name: '인천광역시', fullName: '인천광역시' },
  ];

  // 시/도 생성
  const sidos: District[] = [];
  for (const data of sidoData) {
    const sido = districtRepository.create({
      code: data.code,
      name: data.name,
      fullName: data.fullName,
      level: DistrictLevel.SIDO,
      isActive: true,
      isAbandoned: false,
      parentId: null,
    });
    const savedSido = await districtRepository.save(sido);
    sidos.push(savedSido);
  }

  // 서울 구/군 데이터
  const seoulId = sidos.find((s) => s.name === '서울특별시')?.id;
  const seoulGuData = [
    { code: '1111000000', name: '종로구' },
    { code: '1114000000', name: '중구' },
    { code: '1117000000', name: '용산구' },
    { code: '1120000000', name: '성동구' },
    { code: '1121500000', name: '광진구' },
    { code: '1123000000', name: '동대문구' },
    { code: '1126000000', name: '중랑구' },
    { code: '1129000000', name: '성북구' },
    { code: '1130500000', name: '강북구' },
    { code: '1132000000', name: '도봉구' },
    { code: '1135000000', name: '노원구' },
    { code: '1138000000', name: '은평구' },
    { code: '1141000000', name: '서대문구' },
    { code: '1144000000', name: '마포구' },
    { code: '1147000000', name: '양천구' },
    { code: '1150000000', name: '강서구' },
    { code: '1153000000', name: '구로구' },
    { code: '1154500000', name: '금천구' },
    { code: '1156000000', name: '영등포구' },
    { code: '1159000000', name: '동작구' },
    { code: '1162000000', name: '관악구' },
    { code: '1165000000', name: '서초구' },
    { code: '1168000000', name: '강남구' },
    { code: '1171000000', name: '송파구' },
    { code: '1174000000', name: '강동구' },
  ];

  for (const data of seoulGuData) {
    const gu = districtRepository.create({
      code: data.code,
      name: data.name,
      fullName: `서울특별시 ${data.name}`,
      level: DistrictLevel.SIGUNGU,
      isActive: true,
      isAbandoned: false,
      parentId: seoulId,
    });
    await districtRepository.save(gu);
  }

  // 경기도 시/군 데이터
  const gyeonggiId = sidos.find((s) => s.name === '경기도')?.id;
  const gyeonggiSiData = [
    { code: '4111000000', name: '수원시' },
    { code: '4113000000', name: '성남시' },
    { code: '4117000000', name: '용인시' },
    { code: '4115000000', name: '의정부시' },
    { code: '4118000000', name: '안양시' },
    { code: '4119000000', name: '부천시' },
    { code: '4121000000', name: '광명시' },
    { code: '4122000000', name: '평택시' },
    { code: '4125000000', name: '안산시' },
    { code: '4127000000', name: '고양시' },
    { code: '4128000000', name: '과천시' },
    { code: '4129000000', name: '구리시' },
    { code: '4131000000', name: '남양주시' },
    { code: '4136000000', name: '시흥시' },
    { code: '4139000000', name: '군포시' },
    { code: '4141000000', name: '의왕시' },
    { code: '4143000000', name: '하남시' },
    { code: '4145000000', name: '오산시' },
    { code: '4146000000', name: '화성시' },
    { code: '4148000000', name: '광주시' },
  ];

  for (const data of gyeonggiSiData) {
    const si = districtRepository.create({
      code: data.code,
      name: data.name,
      fullName: `경기도 ${data.name}`,
      level: DistrictLevel.SIGUNGU,
      isActive: true,
      isAbandoned: false,
      parentId: gyeonggiId,
    });
    await districtRepository.save(si);
  }

  // 인천 구/군 데이터
  const incheonId = sidos.find((s) => s.name === '인천광역시')?.id;
  const incheonGuData = [
    { code: '2311000000', name: '중구' },
    { code: '2314000000', name: '동구' },
    { code: '2317000000', name: '미추홀구' },
    { code: '2318500000', name: '연수구' },
    { code: '2320000000', name: '남동구' },
    { code: '2323700000', name: '부평구' },
    { code: '2324500000', name: '계양구' },
    { code: '2326000000', name: '서구' },
  ];

  for (const data of incheonGuData) {
    const gu = districtRepository.create({
      code: data.code,
      name: data.name,
      fullName: `인천광역시 ${data.name}`,
      level: DistrictLevel.SIGUNGU,
      isActive: true,
      isAbandoned: false,
      parentId: incheonId,
    });
    await districtRepository.save(gu);
  }

  console.log('✅ Districts created successfully!');
  console.log(`   - 시/도: ${sidoData.length}개`);
  console.log(
    `   - 구/군: ${seoulGuData.length + gyeonggiSiData.length + incheonGuData.length}개`,
  );
}
