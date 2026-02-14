# Project Plan: Supabase Integration & Vercel Deployment

## 1. Context Assessment

- **Current State**:
  - Frontend: Next.js 14, Tailwind, Shadcn UI.
  - Data: InMemory (Mock Data).
  - Auth: Basic JWT (Manual).
  - Deployment: None (Localhost).
- **Goal**:
  - Chuyển `Mock Data` -> **Supabase Postgres Database**.
  - Chuyển `Manual Auth` -> **Supabase Auth**.
  - Deploy Production lên **Vercel**.

## 2. Architecture: The Vercel + Supabase Stack

- **Frontend**: Next.js (chạy trên Vercel Edge Network).
- **Backend API**: Next.js API Routes (Serverless Functions).
- **Database**: Supabase (Hosted Postgres).
- **Auth**: Supabase Auth (Integrate with Next.js Middleware).
- **Tooling**: `drizzle-orm` (kết nối DB), `supabase-js` (Client SDK).

## 3. Detailed Implementation Steps

### Phase 1: Setup Infrastructure

- [ ] **Supabase Setup**:
  - Tạo Project mới trên Supabase Dashboard.
  - Lấy `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Lấy `DATABASE_URL` (cho Drizzle ORM).
- [ ] **Dependencies**:
  - Cài đặt: `@supabase/ssr`, `@supabase/supabase-js`, `drizzle-orm`, `postgres`.
  - Dev Dep: `drizzle-kit`.

### Phase 2: Database Schema & Migration

- [ ] **Schema Design** (trong `src/db/schema.ts`):
  - Table `profiles`: User info (link với `auth.users` của Supabase).
  - Table `devices`: Thông tin thiết bị.
  - Table `device_history`: Lịch sử thay đổi (Audit Log).
- [ ] **Migration**:
  - Config `drizzle.config.ts`.
  - Chạy `npx drizzle-kit push` để tạo bảng trên Supabase.

### Phase 3: Authentication Refactor

- [ ] **Logout**: Xóa logic JWT cũ (`jose`, `middleware` cũ).
- [ ] **Supabase Auth**:
  - Tạo `utils/supabase/server.ts` (Cookie-based client).
  - Tạo `utils/supabase/client.ts` (Browser client).
  - Update `middleware.ts` để bảo vệ routes bằng Supabase Session.
- [ ] **UI Update**: Sửa form Login để gọi `supabase.auth.signInWithPassword`.

### Phase 4: API & Data Logic

- [ ] **Device API**:
  - Rewrite `src/app/api/devices/route.ts`:
    - `GET`: Select từ DB.
    - `POST`: Insert vào DB.
- [ ] **Realtime (Bonus)**:
  - Subscribe thay đổi DB để tự động update Dashboard (không cần F5).

### Phase 5: Deployment

- [ ] **Vercel**:
  - Import Repo từ Github.
  - Add Environment Variables (Copy từ `.env.local`).
  - Deploy!

## 4. Verification Checklist

- [ ] Login thành công trên môi trường Production.
- [ ] Dữ liệu thêm mới được lưu vào Supabase (kiểm tra trên Table Editor).
- [ ] Reset App không bị mất dữ liệu.
- [ ] API bảo mật (không login không gọi được).

## 5. Resources

- [Supabase Next.js Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Drizzle ORM with Supabase](https://orm.drizzle.team/docs/tutorials/drizzle-with-supabase)
