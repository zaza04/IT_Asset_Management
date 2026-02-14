# PLAN: User Data Isolation (RLS + Docker Self-Host)

> **Approach**: Shared Schema + Row-Level Security (RLS) + Docker Compose self-host
> **Created**: 2026-02-14
> **Updated**: 2026-02-14 (chuyển từ Schema-per-Tenant → RLS)
> **Status**: 📋 Planning

---

## 📊 Context

### Hiện tại

- **Auth**: Supabase Auth ✅ (đã hoạt động)
- **Data storage**: IndexedDB (client-side, zustand + persist)
- **Schema**: Drizzle ORM có `profiles`, `devices`, `activity_logs` (chưa deploy)
- **Vấn đề**: Data lưu trên browser → mất khi đổi máy, không isolate giữa users

### Mục tiêu

- ✅ Mỗi user có **data riêng biệt** (RLS filter by `user_id`)
- ✅ **Supabase-native** — tận dụng 100% features (real-time, auto APIs, dashboard)
- ✅ **Open-source friendly** — community dùng được ngay
- ✅ **Self-host** — Docker Compose cho users muốn full control
- ✅ **Simple migrations** — 1 migration applies cho tất cả users

### Tại sao RLS thay vì Schema-per-Tenant?

1. **Industry standard** — Cal.com, Twenty CRM, Logto đều dùng RLS
2. **PostgreSQL native** — không vendor lock-in
3. **Đơn giản** — thêm `user_id` + SQL policies, không cần quản lý schemas
4. **Full Supabase** — real-time, auto APIs, dashboard viewer đều hoạt động
5. **Migration dễ** — 1 ALTER TABLE = tất cả users

---

## 🏗️ Architecture

```
Database (single public schema):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
profiles       (RLS: auth.uid() = id)
├── id = auth.users.id
├── email, full_name, role
└── settings (JSONB)

devices        (RLS: auth.uid() = user_id)
├── id, user_id ← FK profiles
├── name, type, status, code
├── device_info (JSONB)
└── metadata (JSONB)

device_sheets  (RLS: through devices FK)
├── id, device_id ← FK devices
├── sheet_name, sheet_data (JSONB)
└── sort_order

activity_logs  (RLS: through devices FK)
├── id, device_id ← FK devices
├── action, details
└── created_at
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RLS Flow:
  User login → auth.uid() = 'abc-123'
  SELECT * FROM devices → PostgreSQL tự động thêm WHERE user_id = 'abc-123'
  → User chỉ thấy data của mình, KHÔNG CẦN filter trong code
```

```
Deployment Options:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Supabase Cloud (free tier)     ← Community, dev
2. Docker Compose self-host       ← On-premise, privacy
3. PostgreSQL thuần + docs        ← Advanced users
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📋 Phase Breakdown

### Phase 1: Database Schema + RLS Policies
>
> **Mục tiêu**: Deploy tables lên Supabase với RLS bảo vệ

| Task | Mô tả | Location |
|------|--------|----------|
| 1.1 | Tạo bảng `profiles` (link auth.users) | Supabase Migration |
| 1.2 | Tạo bảng `devices` với cột `user_id` | Supabase Migration |
| 1.3 | Tạo bảng `device_sheets` | Supabase Migration |
| 1.4 | Tạo bảng `activity_logs` | Supabase Migration |
| 1.5 | Enable RLS trên tất cả tables | Supabase Migration |
| 1.6 | Viết RLS policy cho `profiles` | Supabase Migration |
| 1.7 | Viết RLS policies cho `devices` | Supabase Migration |
| 1.8 | Viết RLS policies cho `device_sheets` (through FK) | Supabase Migration |
| 1.9 | Viết RLS policies cho `activity_logs` (through FK) | Supabase Migration |
| 1.10 | Tạo trigger: auth.users INSERT → auto create profile | Supabase Migration |
| 1.11 | Tạo indexes cho performance (user_id, device_id) | Supabase Migration |

**Tables chi tiết:**

```sql
-- profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- devices
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code TEXT,                              -- Asset code (LAP-001)
  name TEXT NOT NULL,
  type TEXT NOT NULL,                     -- Laptop, PC, Monitor
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'broken', 'inactive')),
  device_info JSONB DEFAULT '{}',         -- os, cpu, ram, ip, mac...
  file_name TEXT,                         -- imported file name
  metadata JSONB DEFAULT '{}',            -- totalSheets, tags...
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- device_sheets
CREATE TABLE device_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  sheet_name TEXT NOT NULL,
  sheet_data JSONB DEFAULT '[]',          -- array of row objects
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- activity_logs
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,                   -- create, update, delete, import
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS Policies:**

```sql
-- profiles: user chỉ xem/sửa profile mình
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- devices: user chỉ CRUD devices mình tạo
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own devices"
  ON devices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices"
  ON devices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices"
  ON devices FOR DELETE USING (auth.uid() = user_id);

-- device_sheets: through devices FK
ALTER TABLE device_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own device sheets"
  ON device_sheets FOR ALL
  USING (device_id IN (SELECT id FROM devices WHERE user_id = auth.uid()));

-- activity_logs: through user_id
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs"
  ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own logs"
  ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Verification:**

- [ ] All tables created in Supabase
- [ ] RLS enabled on all tables
- [ ] User A cannot see User B's devices (test query)
- [ ] Auto profile creation on signup
- [ ] Indexes created for performance

---

### Phase 2: Data Access Layer (Server Actions)
>
> **Mục tiêu**: Tạo Server Actions cho CRUD operations

| Task | Mô tả | File |
|------|--------|------|
| 2.1 | Tạo device CRUD Server Actions | `src/app/actions/devices.ts` |
| 2.2 | Tạo device_sheets CRUD Server Actions | `src/app/actions/device-sheets.ts` |
| 2.3 | Tạo activity_logs Server Actions | `src/app/actions/activity-logs.ts` |
| 2.4 | Tạo profile Server Actions | `src/app/actions/profile.ts` |
| 2.5 | Type definitions cho Supabase tables | `src/types/database.ts` |
| 2.6 | Generate Supabase TypeScript types | `src/types/supabase.ts` |

**Server Actions sử dụng Supabase client trực tiếp:**

```
// devices.ts — RLS tự động filter, KHÔNG cần WHERE user_id = ...
getDevices()         → supabase.from('devices').select('*')
getDevice(id)        → supabase.from('devices').select('*').eq('id', id)
createDevice(data)   → supabase.from('devices').insert({ ...data, user_id: user.id })
updateDevice(id, data) → supabase.from('devices').update(data).eq('id', id)
deleteDevice(id)     → supabase.from('devices').delete().eq('id', id)
```

> 💡 **Key insight**: Nhờ RLS, code server actions **không cần filter bằng user_id** cho SELECT/UPDATE/DELETE — PostgreSQL tự filter! Chỉ cần set `user_id` khi INSERT.

**Verification:**

- [ ] CRUD devices works end-to-end
- [ ] CRUD sheets works
- [ ] Activity logging works
- [ ] TypeScript types generated

---

### Phase 3: Frontend Integration
>
> **Mục tiêu**: Kết nối UI components với Server Actions, thay thế IndexedDB

| Task | Mô tả | File |
|------|--------|------|
| 3.1 | Tạo `useDevices()` hook (data fetching) | `src/hooks/useDevices.ts` |
| 3.2 | Tạo `useDeviceSheets()` hook | `src/hooks/useDeviceSheets.ts` |
| 3.3 | Refactor `DeviceList.tsx` → dùng server data | `src/components/dashboard/` |
| 3.4 | Refactor `DeviceDetail.tsx` → dùng server data | `src/components/dashboard/` |
| 3.5 | Refactor import Excel → save to Supabase | Actions/Hooks |
| 3.6 | Refactor export Excel → read from Supabase | Actions/Hooks |
| 3.7 | Update sidebar quick stats → server data | `src/components/app-sidebar.tsx` |
| 3.8 | Sheet editing (cell update, add/remove rows) | Components |
| 3.9 | Device create/edit form → Supabase | Components |
| 3.10 | Loading states, error handling, optimistic updates | UI |

**Dependency decision:**

- **@tanstack/react-query** — caching, mutations, optimistic updates
- Hoặc: **Server Components only** (simpler, nhưng ít control)

**Verification:**

- [ ] Device list loads from Supabase
- [ ] Import Excel → saves to Supabase
- [ ] Export Excel → reads from Supabase
- [ ] Sheet editing persists to database
- [ ] Real-time updates (optional, Supabase Realtime)
- [ ] Loading states smooth

---

### Phase 4: IndexedDB Migration + Cleanup
>
> **Mục tiêu**: Chuyển data hiện có, remove IndexedDB

| Task | Mô tả | File |
|------|--------|------|
| 4.1 | Tạo migration page: đọc IndexedDB → upload Supabase | `src/app/migrate/page.tsx` |
| 4.2 | Progress indicator cho migration | UI |
| 4.3 | Validation: verify data integrity | Migration tool |
| 4.4 | Remove `indexeddb-storage.ts` | `src/lib/` |
| 4.5 | Refactor/remove `useDeviceStore.ts` | `src/stores/` |
| 4.6 | Remove zustand persist config | Store |
| 4.7 | Cleanup unused dependencies | `package.json` |

**Verification:**

- [ ] Existing data migrated successfully
- [ ] No data loss
- [ ] IndexedDB code removed
- [ ] App works purely with Supabase

---

### Phase 5: Docker Self-Host Package
>
> **Mục tiêu**: Community có thể self-host bằng Docker Compose

| Task | Mô tả | File |
|------|--------|------|
| 5.1 | Tạo `Dockerfile` cho Next.js app | `Dockerfile` |
| 5.2 | Tạo `docker-compose.yml` (app + Supabase stack) | `docker-compose.yml` |
| 5.3 | Environment variables template | `.env.example` |
| 5.4 | Init SQL script (schema + RLS policies) | `docker/init.sql` |
| 5.5 | Setup script (first-time config) | `scripts/setup.sh` |
| 5.6 | Self-host documentation | `docs/SELF-HOST.md` |
| 5.7 | Health check endpoints | API routes |

**Docker Compose structure:**

```yaml
services:
  app:                    # Next.js (port 3000)
  supabase-db:            # PostgreSQL 15 (port 5432)
  supabase-auth:          # GoTrue auth service
  supabase-rest:          # PostgREST API
  supabase-studio:        # Dashboard UI (optional)
```

**Verification:**

- [ ] `docker compose up -d` runs successfully
- [ ] App accessible at localhost:3000
- [ ] Auth works (signup, login, logout)
- [ ] Data persists across restarts
- [ ] SELF-HOST.md is clear and complete

---

## 🔗 Dependencies

```
Phase 1 (DB Schema)
    ↓
Phase 2 (Server Actions)
    ↓
Phase 3 (Frontend)  ←  có thể song song một phần
    ↓
Phase 4 (Migration + Cleanup)
    ↓
Phase 5 (Docker)  ←  independent, có thể làm song song Phase 3-4
```

---

## 📦 New Dependencies

| Package | Purpose | Required? |
|---------|---------|-----------|
| `@tanstack/react-query` | Client-side caching, mutations | Recommended |
| (Supabase đã có) | Auth + Database client | ✅ Already installed |
| (Drizzle đã có) | ORM (dùng cho migration scripts) | ✅ Already installed |

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| RLS policy sai → data leak | Critical | Unit test RLS policies, Supabase Advisor |
| JSONB performance với data lớn | Medium | Index JSONB fields, paginate sheets |
| IndexedDB migration data loss | High | Verify count before/after, rollback option |
| Supabase free tier limits | Low | Document upgrade path, Docker self-host |

---

## ⏱️ Timeline ước tính

| Phase | Effort | Duration |
|-------|--------|----------|
| Phase 1: DB Schema + RLS | Low | 1 session |
| Phase 2: Server Actions | Medium | 1-2 sessions |
| Phase 3: Frontend Integration | High | 2-3 sessions |
| Phase 4: Migration + Cleanup | Medium | 1 session |
| Phase 5: Docker Self-Host | Medium | 1-2 sessions |
| **Total** | | **~6-9 sessions** |

---

## ✅ Definition of Done

- [ ] User signup → profile auto created
- [ ] User login → sees ONLY their devices (RLS enforced)
- [ ] CRUD devices works end-to-end via Supabase
- [ ] Import/Export Excel works with Supabase data
- [ ] Sheet editing persists to database
- [ ] IndexedDB fully removed
- [ ] No data leakage between users (verified)
- [ ] Docker Compose self-host works
- [ ] SELF-HOST.md documentation complete
- [ ] Open-source ready (README, .env.example, LICENSE)
