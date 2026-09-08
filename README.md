# SGCC Wiki Frontend

SGCC 공식 위키의 프론트엔드 프로젝트입니다. 카테고리 기반 문서 탐색, Markdown 문서 작성과 미리보기, 검색, 태그, 버전 기록 및 사용자 관리 기능을 제공합니다.

## 기술 스택

- React 19
- Vite 8
- React Router 7
- Axios
- EasyMDE / React Markdown
- ESLint

## 시작하기

Node.js 24 이상 사용을 권장합니다.

```bash
npm ci
npm run dev
```

개발 서버는 기본적으로 `http://localhost:5173`에서 실행됩니다.

백엔드 주소가 기본값인 `http://localhost:8000`과 다르다면 프로젝트 루트에 `.env.local`을 만들고 다음 값을 설정합니다.

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 운영용 번들 생성 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | 코드 스타일 및 오류 검사 |

변경사항을 제출하기 전에는 다음 명령어를 실행합니다.

```bash
npm run lint
npm run build
```

## 개발 컨벤션

### 브랜치

- `main`: 배포 가능한 안정 브랜치
- `develop`: 기능 통합 브랜치
- 기능 작업: `feat/<name>`
- 버그 수정: `fix/<name>`

일반적인 작업 순서는 기능 브랜치 → `develop` → `main`입니다.

### 커밋 메시지

```text
<type>: <description>
```

- `feat`: 기능 추가
- `fix`: 버그 수정
- `chore`: 설정, 문서, 기타 유지보수
- `refactor`: 동작 변경 없는 코드 개선
- `style`: UI 또는 코드 스타일 변경
- `test`: 테스트 추가 및 수정

예시:

```text
feat: add document sort options
fix: keep category popup hover connected
chore: readme
```


## 주요 디렉터리

```text
src/
├─ assets/             이미지 및 아이콘
├─ backend/            Axios 설정
├─ component/
│  ├─ account/         로그인, 회원가입, 프로필
│  ├─ docs/            문서 조회, 작성, 검색
│  ├─ layout/          공통 레이아웃과 목록
│  ├─ page/            관리자 및 기타 페이지
│  ├─ ui/              공통 UI
│  └─ util/            API 및 공통 함수
├─ App.jsx             라우트 설정
└─ main.jsx            애플리케이션 진입점
```
