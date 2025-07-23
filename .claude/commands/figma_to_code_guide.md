# Figma 기반 화면 개발 지침서

## 📋 개발 목표

- **1차 목표**: 레이아웃 구조 잡기 및 폰트 스타일 적용
- **범위 제한**: 세부 기능 구현 및 함수 작성은 제외
- **우선순위**: 시각적 레이아웃 완성도 > 기능 구현

## 🎨 Figma 정보 입력 형태

```json
{
  "nodeId": "5346-28633",
  "fileKey": "HhYjGEhs1v8cz1bUTvxUSX"
}
```

## 📁 컴포넌트 구조 및 파일 구성

### 기본 파일 구조

```
component-name/
├── ComponentName.tsx     # 메인 컴포넌트 파일
├── index.ts             # export 파일 (export * from './ComponentName';)
└── styles.module.scss   # 스타일 파일
```

### 페이지 구조 (pages 폴더)

```
page-name/
├── index.ts            # export 파일 (export * from './ui';)
└── ui/
    ├── index.ts        # export 파일 (export * from './page-component';)
    └── page-component/
        ├── PageComponent.tsx
        ├── index.ts    # export 파일 (export * from './PageComponent';)
        └── styles.module.scss
```

### Import/Export 규칙

```tsx
// 컴포넌트 파일에서
export const ComponentName = () => {
  // 컴포넌트 로직
};

// index.ts 파일에서
export * from "./ComponentName";
```

### CSS 클래스 네이밍 컨벤션

- **camelCase 사용**: `.containerBox`, `.titleSection`, `.searchControl`
- **의미 있는 이름**: 역할이나 용도를 명확히 표현
- **독립적 클래스명**: 가능한 한 부모-자식 중첩 구조 지양

```scss
// ✅ 권장: 독립적인 클래스명
.container {
}
.titleSection {
}
.subtitleText {
}
.mainContent {
}
.searchControl {
}

// "&" 사용은 hover, focus 등 pseudo-class에만 활용
.button {
  &:hover {
    background-color: var(--color-main-02);
  }
  &:focus {
    outline: 1px solid var(--color-sub-blue-01);
  }
}
```

## 🏗️ 레이아웃 구성 가이드

### 레이아웃 선택 기준

**큰 단위 레이아웃 → CSS Grid 사용**

- 전체 페이지 레이아웃 구조
- 카드형 컴포넌트 배치 (3x3, 2x4 등)
- 복잡한 2차원 레이아웃
- 반응형 그리드 시스템
- 섹션 단위의 큰 영역 배치

```scss
// ✅ Grid 사용 - 큰 단위 레이아웃
.pageLayout {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: var(--space-20);
}

.cardGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-16);
}
```

**작은 단위 레이아웃 → Flexbox 사용**

- 아이콘과 텍스트 조합
- 버튼 내부 요소 정렬
- 네비게이션 메뉴
- 카드 내부의 작은 요소들
- 단순한 1차원 정렬 (수평/수직)

```scss
// ✅ Flex 사용 - 작은 단위 레이아웃
.iconTextGroup {
  display: flex;
  align-items: center;
  gap: var(--space-06);
}

.buttonContent {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-04);
}

.cardContent {
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}
```

### 🚫 사용 금지 레이아웃

- **inline-flex 사용 금지**: `display: inline-flex`는 사용하지 않습니다
- **이유**: 예측하기 어려운 레이아웃 동작과 반응형 디자인 구현의 어려움
- **대안**: `display: flex` 또는 `display: grid` 사용

```scss
// ❌ 금지: inline-flex 사용
.wrongLayout {
  display: inline-flex; // 사용 금지
}

// ✅ 권장: flex 또는 grid 사용
.correctLayout {
  display: flex;
  // 또는
  display: grid;
}
```

## 📦 컴포넌트 Import 및 사용 가이드

### 필수 Import

```tsx
// 외부 디자인 시스템에서 import
import {
  Button,
  Typo,
  Modal,
  Input,
  Select,
  Table,
} from "@gongsaero/design-system";

// classnames 유틸리티 import (필수)
import cn from "classnames";

// 프로젝트 내부 상수에서 import
import { COLOR, SIZE, TYPE } from "@/shared/constants";
```

### className 조합 사용법

**기본 원칙**: 조건부 클래스 적용 시 `classnames` 라이브러리 사용

```tsx
// ✅ 권장: classnames 사용
<div className={cn(s.customTable, { [s.tableViewAll]: viewAll })}>
  테이블 컨텐츠
</div>

<button
  className={cn(s.button, s.primaryButton, {
    [s.active]: isActive,
    [s.disabled]: isDisabled
  })}
>
  버튼
</button>

// ❌ 지양: 삼항연산자 사용
<div className={`${s.customTable} ${viewAll ? s.tableViewAll : ''}`}>
  테이블 컨텐츠
</div>
```

**실제 사용 예시**:

```tsx
import cn from "classnames";
import s from "./styles.module.scss";

export const TableComponent = ({ viewAll, isLoading, hasError }) => {
  return (
    <div
      className={cn(s.tableContainer, {
        [s.viewAllMode]: viewAll,
        [s.loading]: isLoading,
        [s.error]: hasError,
      })}
    >
      <Table
        className={cn(s.dataTable, { [s.compactView]: !viewAll })}
        // ... 기타 props
      />
    </div>
  );
};
```

## 🎛️ 디자인 시스템 컴포넌트 사용 가이드

### 🎯 Typo 컴포넌트

#### 기본 사용법

```tsx
<Typo as={"element"} type={"font_type"} color={"color_value"}>
  텍스트 내용
</Typo>
```

#### 사용 가능한 Props

- **as**: HTML 엘리먼트 타입 ('p', 'h1', 'span', 'div' 등)
- **type**: 폰트 스타일 타입
- **color**: 색상 값 (hex 코드)

#### Font Type 옵션

**SemiBold (600)**:

```
s_bold_40, s_bold_38, s_bold_34, s_bold_30, s_bold_26,
s_bold_24, s_bold_21, s_bold_20, s_bold_19, s_bold_18,
s_bold_17, s_bold_16, s_bold_15
```

**Medium (500)**:

```
md_26, md_24, md_21, md_20, md_19, md_18,
md_17, md_16, md_15, md_14
```

**Regular (400)**:

```
regular_40, regular_34, regular_30, regular_21, regular_20,
regular_19, regular_18, regular_17, regular_16, regular_15,
regular_14, regular_13
```

#### 색상 값 적용

```tsx
// Hex 코드 사용 (권장)
<Typo as={'p'} type={'s_bold_26'} color={'#111111'}>
  메인 제목
</Typo>
<Typo as={'p'} type={'regular_15'} color={'#666666'}>
  서브 텍스트
</Typo>

// 디자인 시스템에 없는 색상/폰트 사이즈 발견시
<span style={{ color: '#FF0000', fontSize: '22px' }}>
  커스텀 텍스트
</span>
```

### 📄 Pagination 컴포넌트

#### 기본 사용법

```tsx
import { Pagination } from "@gongsaero/design-system";

// 기본 페이지네이션
<Pagination
  total={500}
  current={1}
  pageSize={10}
  onChange={handlePageChange}
/>;
```

#### 사용 가능한 Props

**필수 Props**:

- `total` - 전체 데이터 개수 (number)
- `onChange` - 페이지 변경 시 호출되는 함수

**선택적 Props**:

- `current` - 현재 페이지 번호 (기본값: 1)
- `defaultCurrent` - 초기 페이지 번호
- `pageSize` - 페이지당 표시할 데이터 개수 (기본값: 10)
- `defaultPageSize` - 초기 페이지 크기
- `onShowSizeChange` - 페이지 크기 변경 시 호출되는 함수
- `align` - 정렬 방향 ('start' | 'center' | 'end')
- `className` - 추가 CSS 클래스

#### 실제 사용 예시

```tsx
// 모달 하단 페이지네이션
<Pagination
  total={totalCount}
  current={currentPage}
  pageSize={pageSize}
  onChange={(page) => setCurrentPage(page)}
  align="center"
/>

// 테이블 하단 페이지네이션
<Pagination
  total={data.total}
  current={pagination.current}
  pageSize={pagination.pageSize}
  onChange={handlePageChange}
  onShowSizeChange={handlePageSizeChange}
  className={s.tablePagination}
/>
```

### 🔘 Button 컴포넌트

#### 기본 사용법

```tsx
import { Button } from '@gongsaero/design-system';
import { SIZE, TYPE } from '@/shared/constants';

// 기본 버튼
<Button>기본 버튼</Button>

// 사이즈와 타입을 지정한 버튼
<Button size={SIZE.BUTTON.LG} type={TYPE.BUTTON.SOLID.OG}>
  오렌지 버튼
</Button>
```

#### 사용 가능한 Props

**size (버튼 크기)**:

- `SIZE.BUTTON.XS` - 최소 너비 68px, 높이 28px
- `SIZE.BUTTON.SM` - 최소 너비 88px, 높이 34px
- `SIZE.BUTTON.MD` - 최소 너비 96px, 높이 40px (기본값)
- `SIZE.BUTTON.LG` - 최소 너비 120px, 높이 44px

**type (버튼 스타일)**:

- `TYPE.BUTTON.SOLID.BL` - 파란색 솔리드 (기본값)
- `TYPE.BUTTON.SOLID.BK` - 검은색 솔리드
- `TYPE.BUTTON.SOLID.OG` - 오렌지색 솔리드
- `TYPE.BUTTON.OUTLINE.BK` - 검은색 아웃라인
- `TYPE.BUTTON.OUTLINE.OG` - 오렌지색 아웃라인

**기타 Props**:

- `prefix` - 버튼 앞에 아이콘 추가
- `iconOnly` - 아이콘 전용 정사각형 버튼
- `disabled` - 비활성 상태

#### 실제 사용 예시

```tsx
// 기본 블루 버튼
<Button size={SIZE.BUTTON.MD} type={TYPE.BUTTON.SOLID.BL}>
  확인
</Button>

// 아이콘이 있는 버튼
<Button
  size={SIZE.BUTTON.LG}
  type={TYPE.BUTTON.SOLID.OG}
  prefix={<DownloadIcon />}
>
  다운로드
</Button>

// 아이콘 전용 버튼
<Button
  size={SIZE.BUTTON.MD}
  type={TYPE.BUTTON.OUTLINE.BK}
  prefix={<SettingsIcon />}
  iconOnly={true}
/>
```

### 📝 Select 컴포넌트

#### 기본 사용법

```tsx
import { Select } from "@gongsaero/design-system";
import { SIZE } from "@/shared/constants";

// 기본 셀렉트
<Select options={options} placeholder="선택하세요" onChange={handleChange} />;
```

#### 사용 가능한 Props

**size (셀렉트 크기)**:

- `SIZE.SELECT.SM` - 높이 34px (기본값)
- `SIZE.SELECT.MD` - 높이 40px
- `SIZE.SELECT.LG` - 높이 44px

**options (선택 옵션)**:

```tsx
const options = [
  { label: "옵션 1", value: "option1" },
  { label: "옵션 2", value: "option2" },
  { label: "옵션 3", value: "option3" },
];
```

**기타 Props**:

- `placeholder` - 플레이스홀더 텍스트
- `helpText` - 셀렉트 하단에 표시될 도움말 텍스트
- `disabled` - 비활성 상태
- `status` - 에러 상태 (`'error'`)
- `value` - 현재 선택된 값
- `suffix` - 커스텀 드롭다운 아이콘

#### 스타일링 주의사항

```scss
// SCSS에서 Select 너비 조정
:global(.ant-select) {
  width: 240px;

  @include breakpoint("mb") {
    width: 100%;
  }
}
```

### 📝 Input 컴포넌트

#### 기본 사용법

```tsx
import { Input } from "@gongsaero/design-system";
import { SIZE, TYPE } from "@/shared/constants";

// 기본 인풋
<Input placeholder="텍스트를 입력하세요" onChange={handleChange} />;
```

#### 사용 가능한 Props

**size (인풋 크기)**:

- `SIZE.INPUT.SM` - 높이 34px
- `SIZE.INPUT.MD` - 높이 40px (기본값)
- `SIZE.INPUT.LG` - 높이 44px

**type (인풋 타입)**:

- `TYPE.INPUT.TEXT` - 일반 텍스트 (기본값)
- `TYPE.INPUT.PASSWORD` - 비밀번호
- `TYPE.INPUT.NUMBER` - 숫자

**기타 Props**:

- `placeholder` - 플레이스홀더 텍스트
- `helpText` - 인풋 하단에 표시될 도움말 텍스트
- `disabled` - 비활성 상태
- `status` - 에러 상태 (`'error'`)
- `suffix` - 인풋 오른쪽에 표시될 요소 (아이콘 등)
- `onPressEnter` - Enter 키 입력 시 실행될 함수

#### 검색 인풋 조합 패턴

Input과 Button을 조합한 검색 기능 구현 예시:

```tsx
<div className={s.searchInputSection}>
  <Input
    className={s.searchInput}
    placeholder="공급사명 검색"
    size={SIZE.INPUT.SM}
    onChange={({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      update({ keyword: value });
    }}
    onPressEnter={handleSearch}
  />
  <Button
    iconOnly
    size={SIZE.BUTTON.SM}
    onClick={handleSearch}
    prefix={<SearchSVG size={SIZE.ICON.XXS} color={COLOR.GREY.L00} />}
  />
</div>
```

```scss
// 검색 인풋 섹션 스타일링
.searchInputSection {
  display: flex;
  align-items: center;
  gap: var(--space-08);
  width: 174px;

  @include breakpoint("tb") {
    width: 100%;
  }
}
```

### 📋 Table 컴포넌트

#### 기본 사용법

```tsx
import { Table } from "@gongsaero/design-system";
import { TYPE } from "@/shared/constants";

// 기본 테이블
<Table columns={columns} dataSource={dataSource} type={TYPE.TABLE.DETAIL} />;
```

#### 사용 가능한 Props

**type (테이블 스타일)**:

- `TYPE.TABLE.DETAIL` - 상세 테이블 (행 높이 58px, 상세 정보용)
- `TYPE.TABLE.LIST` - 목록 테이블 (행 높이 48px, 목록 표시용)

**필수 Props**:

- `columns` - 테이블 컬럼 정의 배열
- `dataSource` - 테이블에 표시할 데이터 배열

**기타 Props**:

- `className` - 추가 CSS 클래스
- `pagination` - 페이지네이션 설정 (기본값: false)
- `bordered` - 테두리 표시 (기본값: true)

#### 컬럼 정의 예시

```tsx
const columns = [
  {
    title: "이름",
    dataIndex: "name",
    key: "name",
    width: 120,
    align: "center" as const,
  },
  {
    title: "나이",
    dataIndex: "age",
    key: "age",
    width: 80,
    align: "center" as const,
  },
  {
    title: "이메일",
    dataIndex: "email",
    key: "email",
    ellipsis: true,
  },
];
```

#### 데이터 구조 예시

```tsx
const dataSource = [
  {
    key: 1,
    name: "홍길동",
    age: 32,
    email: "hong@example.com",
  },
  {
    key: 2,
    name: "김철수",
    age: 42,
    email: "kim@example.com",
  },
];
```

#### Summary(요약행) 사용법

```tsx
<Table
  columns={columns}
  dataSource={dataSource}
  type={TYPE.TABLE.DETAIL}
  summary={() => (
    <Table.Summary fixed>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={3}>
          총 {dataSource.length}건
        </Table.Summary.Cell>
        <Table.Summary.Cell index={3}>합계: 1,000원</Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  )}
/>
```

#### 실제 사용 예시

```tsx
// 상세 테이블 (높은 행 높이)
<Table
  type={TYPE.TABLE.DETAIL}
  columns={detailColumns}
  dataSource={detailData}
  className={cn(s.detailTable, { [s.expandedView]: isExpanded })}
/>

// 목록 테이블 (낮은 행 높이)
<Table
  type={TYPE.TABLE.LIST}
  columns={listColumns}
  dataSource={listData}
  className={cn(s.listTable, { [s.compactMode]: isCompact })}
/>

// 요약행이 있는 테이블
<Table
  type={TYPE.TABLE.DETAIL}
  columns={columns}
  dataSource={data}
  summary={() => (
    <Table.Summary>
      <Table.Summary.Row>
        <Table.Summary.Cell index={0} colSpan={8}>
          전체 합계
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  )}
/>
```

#### 테이블 스타일링 참고사항

- 테이블 스타일은 이미 디자인 시스템에서 완성되어 있음
- 추가 스타일링이 필요한 경우 className prop 활용
- 컬럼 너비 조정은 columns 정의에서 width 속성 사용
- 빈 데이터일 때는 "검색결과가 없습니다" 메시지가 자동 표시됨

### 🤔 알 수 없는 컴포넌트 사용 가이드

- **원칙**: 사용법을 모르는 컴포넌트는 즉시 구현하지 말고 질문하기
- **질문 포맷**: "○○ 컴포넌트의 사용법을 알려주세요. 어떤 props가 필요한가요?"

```tsx
// ❌ 추측으로 작성하지 마세요
<UnknownComponent prop1="value" prop2={true} />

// ✅ 질문을 먼저 던지세요
// "UnknownComponent의 사용법을 알려주세요"
```

## 🎨 SCSS 스타일링 가이드

### Mixin Import

```scss
@use "@/shared/config/mixins" as *;
```

### Global 변수 사용 우선

```scss
// ✅ 권장: Global 변수 사용
.container {
  padding: var(--space-20);
  margin: var(--space-16);
  border-radius: var(--radius-10);
  background-color: var(--color-grey-00);
}

// ❌ 지양: 하드코딩된 값
.container {
  padding: 20px;
  margin: 16px;
  border-radius: 10px;
  background-color: #ffffff;
}
```

### 사용 가능한 CSS 변수들

#### 여백 (Spacing)

```scss
--space-02: 2px;
--space-04: 4px;
--space-06: 6px;
--space-08: 8px;
--space-10: 10px;
--space-12: 12px;
--space-14: 14px;
--space-16: 16px;
--space-18: 18px;
--space-20: 20px;
--space-24: 24px;
--space-26: 26px;
--space-30: 30px;
--space-40: 40px;
```

#### 색상 (Colors)

```scss
// 메인 컬러
--color-main-01: #042766;
--color-main-02: #2d559d;
--color-main-03: #658bd1;
--color-main-04: #b1c2e0;
--color-main-05: #f2f7ff;

// 서브 컬러 - 블루
--color-sub-blue-01: #4b79ee;
--color-sub-blue-02: #8bacff;
--color-sub-blue-03: #bdd0ff;
--color-sub-blue-04: #deedfe;
--color-sub-blue-05: #f8fbff;

// 서브 컬러 - 그린
--color-sub-green-01: #50bb5e;
--color-sub-green-02: #2d9d3c;
--color-sub-green-03: #c0e2c5;
--color-sub-green-04: #ddede0;
--color-sub-green-05: #f7fcf8;

// 포인트 컬러
--color-point-01: #f27019;
--color-point-02: #ff893a;
--color-point-03: #ffa96f;
--color-point-04: #ffd0b1;
--color-point-05: #fff6f0;

// 그레이 스케일
--color-grey-01: #111111;
--color-grey-02: #222222;
--color-grey-03: #444444;
--color-grey-04: #666666;
--color-grey-05: #999999;
--color-grey-06: #aaaaaa;
--color-grey-07: #cccccc;
--color-grey-08: #e1e1e1;
--color-grey-09: #eeeeee;
--color-grey-10: #f4f4f4;
--color-grey-11: #f8f8f8;
--color-grey-00: #ffffff;
```

#### 보더 반경 (Border Radius)

```scss
--radius-04: 4px;
--radius-06: 6px;
--radius-10: 10px;
--radius-full: 50%;
```

## 📱 반응형 가이드

### 브레이크포인트

- **Desktop**: 1280px 이상
- **Tablet**: 769px ~ 1279px
- **Mobile**: 768px 이하

### 반응형 Mixin 사용

```scss
.container {
  width: 100%;
  max-width: 1380px;

  @include breakpoint("tb") {
    width: 708px;
  }

  @include breakpoint("mb") {
    width: 360px;
    padding: 0 var(--space-20);
  }
}
```

### 적용 예시

```scss
// 큰 단위 - Grid 사용
.pageLayout {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-20);

  @include breakpoint("tb") {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-16);
  }

  @include breakpoint("mb") {
    grid-template-columns: 1fr;
    gap: var(--space-12);
  }
}

// 작은 단위 - Flex 사용
.cardContent {
  display: flex;
  align-items: center;
  gap: var(--space-12);

  @include breakpoint("mb") {
    flex-direction: column;
    gap: var(--space-08);
  }
}
```

## 🚫 개발 제한 사항

- 세부 기능 구현 금지
- 복잡한 함수 작성 금지
- API 연동 코드 작성 금지
- 상태 관리 로직 구현 금지
- 이벤트 핸들러는 빈 함수로만 선언
- **우측 하단 플로팅 메뉴는 별도 구현하지 않음** (다른 곳에서 제작)

## ⚠️ 예외 상황 처리

### 디자인 시스템에 없는 색상/폰트 사이즈 발견시

**기본 원칙**: 일반적으로 인라인 스타일은 사용하지 않지만, 디자인 시스템에 없는 색상이나 폰트를 발견했을 때는 **나중에 수정하기 편하도록 인라인 스타일로 작성**

```tsx
// Typo 컴포넌트 대신 span 태그 + 인라인 스타일 사용
<span style={{
  color: '#FF5722',        // 디자인 시스템에 없는 색상
  fontSize: '22px',        // 디자인 시스템에 없는 폰트 크기
  fontWeight: 600,
  lineHeight: '30px'
}}>
  커스텀 스타일 텍스트
</span>

// 또는 div 태그 사용
<div style={{
  backgroundColor: '#E8F4FD',  // 디자인 시스템에 없는 배경색
  padding: '15px',             // 디자인 시스템에 없는 여백
  borderRadius: '8px'          // 디자인 시스템에 없는 반경
}}>
  커스텀 스타일 컨테이너
</div>
```

**이유**: 인라인 스타일로 작성하면 나중에 해당 부분을 쉽게 찾아서 디자인 시스템에 추가하거나 CSS 변수로 교체할 수 있습니다.

### 알 수 없는 컴포넌트 발견시

1. 즉시 구현하지 말고 질문하기
2. 질문 형식: "○○ 컴포넌트의 props와 사용법을 알려주세요"
3. 임시로 div나 placeholder 사용하여 레이아웃만 잡기

## ✅ 체크리스트

- [ ] 파일 구조가 프로젝트 컨벤션에 맞는지 확인
- [ ] `classnames` 라이브러리를 사용하여 조건부 클래스 적용
- [ ] 큰 단위는 CSS Grid, 작은 단위는 Flexbox 사용
- [ ] Typo 컴포넌트로 모든 텍스트 처리
- [ ] camelCase로 CSS 클래스명 작성
- [ ] CSS 변수 활용한 스타일링
- [ ] 반응형 디자인 적용
- [ ] 모르는 컴포넌트는 질문 후 구현
- [ ] 기능 구현 없이 UI만 완성
- [ ] inline-flex 사용하지 않기
- [ ] 우측 하단 플로팅 메뉴는 구현하지 않기
