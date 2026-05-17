# 🌱 오늘의 화분 키우기

투두리스트를 완성하며 화분을 키우는 웹 서비스

## 기술 스택
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **DB + Auth**: Supabase (PostgreSQL)
- **Deploy**: Vercel

## 시작하기

### 1. Supabase 프로젝트 생성
1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. `supabase/schema.sql` 내용을 SQL Editor에서 실행
3. Project URL과 anon key 복사

### 2. 환경 변수 설정
```bash
cp .env.example .env.local
```
`.env.local`에 Supabase 정보 입력:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 로컬 실행
```bash
npm install && npm run dev
```

### 4. Vercel 배포
1. GitHub push → vercel.com에서 레포 import
2. Environment Variables에 env.local 내용 입력 → Deploy
