# 🖥️ IT Assets Management — Device Dashboard

Ứng dụng web quản lý tài sản IT (thiết bị, phần cứng) xây dựng trên **Next.js 16** + **Supabase**. Giao diện hiện đại, hỗ trợ import/export Excel, quản lý CRUD, drag-and-drop, dark/light mode, và xác thực người dùng.

---

## 📑 Mục lục

- [✨ Tính năng chính](#-tính-năng-chính)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Cấu trúc dự án](#-cấu-trúc-dự-án)
- [🚀 Bắt đầu](#-bắt-đầu)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [1. Clone & Cài đặt](#1-clone--cài-đặt)
  - [2. Thiết lập Database](#2-thiết-lập-database)
  - [3. Cấu hình Environment](#3-cấu-hình-environment)
  - [4. Chạy ứng dụng](#4-chạy-ứng-dụng)
- [🗄️ Database Schema](#️-database-schema)
- [🐳 Docker Deployment](#-docker-deployment)
- [⚙️ Environment Variables](#️-environment-variables)
- [📄 License](#-license)
- [🤝 Đóng góp](#-đóng-góp)

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
| 🔐 **Xác thực người dùng** | Đăng nhập / Đăng ký qua Supabase Auth, bảo vệ route bằng Middleware |
| 📊 **Dashboard tổng quan** | Biểu đồ thống kê thiết bị, hoạt động gần đây, tổng quan phần cứng |
| 📥 **Import Excel** | Kéo thả file `.xlsx` — hỗ trợ import nhiều files, chọn sheets trước khi import |
| ➕ **Tạo thiết bị** | Tạo mới thiết bị thủ công với form nhập thông tin chi tiết |
| 📋 **Danh sách thiết bị** | Bảng với sắp xếp, tìm kiếm, lọc theo trạng thái, phân trang |
| 🔍 **Xem chi tiết** | Modal hiển thị thông tin thiết bị với nhiều tab sheet dữ liệu |
| ✏️ **Chỉnh sửa inline** | Chỉnh sửa trực tiếp dữ liệu trong bảng, thêm/xóa cột và sheet |
| 🔀 **Drag & Drop** | Kéo thả sắp xếp lại thứ tự các tab sheet |
| ↩️ **Undo / Redo** | Hoàn tác & làm lại với `Ctrl+Z` / `Ctrl+Y` |
| ☑️ **Thao tác hàng loạt** | Chọn nhiều thiết bị → đổi trạng thái / xuất file / xóa cùng lúc |
| 📤 **Xuất Excel** | Xuất dữ liệu thiết bị ngược lại thành file `.xlsx` |
| 🎨 **Dark / Light mode** | Tuỳ chỉnh giao diện, đồng bộ theme giữa các phiên đăng nhập |
| 👥 **Người dùng** | Tab quản lý người dùng (đang phát triển) |
| 📖 **Tài liệu** | Tab hướng dẫn sử dụng (đang phát triển) |
| ⌨️ **Command Palette** | Tìm kiếm nhanh và điều hướng bằng `Ctrl+K` |

---

## 🛠️ Tech Stack

| Lớp | Công nghệ |
|---|---|
| **Framework** | Next.js 16.1.1, React 19, TypeScript 5.9 |
| **Styling** | Tailwind CSS 4.x, shadcn/ui (Radix UI) |
| **Backend** | Supabase (Auth + PostgreSQL + Storage) |
| **State** | React Query (TanStack), Zustand |
| **Data** | SheetJS (xlsx), TanStack Table, TanStack Virtual |
| **Interactions** | @dnd-kit, react-dropzone, react-resizable-panels |
| **UI Extras** | Lucide Icons, Recharts, cmdk, Sonner, next-themes |
| **Validation** | React Hook Form + Zod |

---

## 📁 Cấu trúc dự án

<details>
<summary>📂 Click để xem cấu trúc thư mục chi tiết</summary>

```
device-dashboard/
├── public/                  # Static assets (favicon, images)
├── docker/
│   └── init.sql             # Database initialization script
├── src/
│   ├── app/
│   │   ├── (auth)/          # Trang đăng nhập / đăng ký
│   │   │   ├── sign-in/     # Đăng nhập
│   │   │   ├── sign-up/     # Đăng ký
│   │   │   └── layout.tsx   # Auth layout (2-column)
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/   # Trang tổng quan
│   │   │   ├── devices/     # Quản lý thiết bị (CRUD)
│   │   │   ├── users/       # Quản lý người dùng (placeholder)
│   │   │   ├── docs/        # Tài liệu hướng dẫn (placeholder)
│   │   │   ├── settings/    # Cài đặt (Appearance, Account)
│   │   │   └── layout.tsx   # Dashboard layout (Sidebar + Header)
│   │   ├── actions/         # Server Actions (auth, profile, devices)
│   │   ├── api/             # API routes
│   │   ├── globals.css      # CSS variables, Tailwind config
│   │   └── layout.tsx       # Root layout (Providers)
│   ├── components/
│   │   ├── auth/            # Sign-in/Sign-up forms
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── DeviceList.tsx          # Bảng danh sách thiết bị
│   │   │   ├── DeviceDetail.tsx        # Modal chi tiết / chỉnh sửa
│   │   │   ├── ImportDevice.tsx        # Kéo thả import file
│   │   │   ├── SheetTable.tsx          # Bảng dữ liệu sheet
│   │   │   ├── CreateDeviceDialog.tsx  # Dialog tạo thiết bị mới
│   │   │   ├── HardwareOverview.tsx    # Card tổng quan phần cứng
│   │   │   └── RecentActivity.tsx      # Hoạt động gần đây
│   │   ├── ui/              # shadcn/ui components
│   │   ├── theme-provider.tsx
│   │   ├── theme-sync-provider.tsx     # Đồng bộ theme với DB
│   │   └── app-sidebar.tsx             # Sidebar navigation
│   ├── contexts/            # React contexts (Auth, Sidebar)
│   ├── hooks/               # Custom React hooks
│   ├── providers/           # QueryProvider (React Query)
│   ├── stores/              # Zustand stores
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utility functions
│   ├── config/              # App configuration
│   └── utils/               # Supabase client, middleware helpers
├── docker-compose.yml       # Docker services config
├── Dockerfile               # Multi-stage build
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

</details>

---

## 🚀 Bắt đầu

### Yêu cầu hệ thống

| Phần mềm | Phiên bản | Ghi chú |
|---|---|---|
| **Node.js** | >= 18.x | [Tải tại đây](https://nodejs.org/) |
| **npm** | >= 9.x | Đi kèm Node.js |
| **Docker** | Latest | Chỉ cần nếu self-host database |
| **Git** | Latest | Để clone repo |

### 1. Clone & Cài đặt

```bash
# Clone repository
git clone https://github.com/duacacao/IT_Asset_Management.git
cd device-dashboard

# Cài đặt dependencies
npm install
```

### 2. Thiết lập Database

Bạn có **2 lựa chọn** để thiết lập database:

#### Tùy chọn A: Supabase Cloud ☁️ (Khuyên dùng)

1. Tạo tài khoản tại [supabase.com](https://supabase.com)
2. Tạo project mới → Chọn region gần nhất
3. Vào **Project Settings > API** để lấy:
   - `Project URL` → dùng làm `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → dùng làm `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Vào **SQL Editor** → Chạy nội dung file `docker/init.sql` để tạo các bảng

#### Tùy chọn B: Self-hosted với Docker 🐳

```bash
# Khởi chạy PostgreSQL container
docker-compose up -d db

# Database sẽ tự động chạy init.sql khi khởi tạo lần đầu
```

> ⚠️ **Lưu ý:** Code hiện tại sử dụng `supabase-js` SDK. Để chạy local hoàn toàn, bạn cần chạy Supabase local stack:
>
> ```bash
> npx supabase init
> npx supabase start
> ```
>
> Hoặc refactor sang Drizzle ORM để kết nối trực tiếp PostgreSQL thuần.

### 3. Cấu hình Environment

```bash
# Copy file mẫu
cp .env.example .env.local

# Mở .env.local và điền thông tin
```

Xem chi tiết các biến tại mục [⚙️ Environment Variables](#️-environment-variables).

### 4. Chạy ứng dụng

```bash
# Development mode
npm run dev
```

Truy cập 👉 [http://localhost:3000](http://localhost:3000)

**Tài khoản mặc định** (nếu đã tạo qua Supabase):

- Tự đăng ký tại trang `/sign-up`
- Đăng nhập bằng username (sẽ tự ghép thành `username@it-management.local`)

---

## 🗄️ Database Schema

<details>
<summary>📊 Click để xem sơ đồ Database (4 bảng)</summary>

### Tổng quan

```
profiles ─────┐
              ├──► devices ──► device_sheets
              ├──► activity_logs
              └────────────────┘
```

### Bảng `profiles` — Thông tin người dùng

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID (PK) | ID người dùng |
| `email` | TEXT (UNIQUE) | Email đăng nhập |
| `full_name` | TEXT | Tên hiển thị |
| `role` | TEXT | Vai trò (`user`, `admin`) |
| `settings` | JSONB | Cài đặt cá nhân (theme, preferences…) |
| `created_at` | TIMESTAMPTZ | Ngày tạo |
| `updated_at` | TIMESTAMPTZ | Ngày cập nhật |

### Bảng `devices` — Thiết bị

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID (PK) | ID thiết bị |
| `user_id` | UUID (FK → profiles) | Người sở hữu |
| `code` | TEXT | Mã thiết bị |
| `name` | TEXT | Tên thiết bị |
| `type` | TEXT | Loại (Laptop, Desktop, Monitor…) |
| `status` | TEXT | Trạng thái (`active`, `broken`, `inactive`) |
| `device_info` | JSONB | Thông tin chi tiết thiết bị |
| `file_name` | TEXT | Tên file Excel gốc (nếu import) |
| `metadata` | JSONB | Metadata bổ sung |
| `specs` | JSONB | Thông số kỹ thuật |
| `created_at` | TIMESTAMPTZ | Ngày tạo |
| `updated_at` | TIMESTAMPTZ | Ngày cập nhật |

### Bảng `device_sheets` — Sheet dữ liệu

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | UUID (PK) | ID sheet |
| `device_id` | UUID (FK → devices) | Thiết bị sở hữu |
| `sheet_name` | TEXT | Tên sheet |
| `sheet_data` | JSONB | Dữ liệu dạng JSON array |
| `sort_order` | INTEGER | Thứ tự sắp xếp |
| `created_at` | TIMESTAMPTZ | Ngày tạo |

### Bảng `activity_logs` — Lịch sử hoạt động

| Cột | Kiểu | Mô tả |
|---|---|---|
| `id` | SERIAL (PK) | ID log |
| `device_id` | UUID (FK → devices) | Thiết bị liên quan |
| `user_id` | UUID (FK → profiles) | Người thực hiện |
| `action` | TEXT | Hành động (create, update, delete…) |
| `details` | TEXT | Chi tiết bổ sung |
| `created_at` | TIMESTAMPTZ | Thời gian |

### SQL khởi tạo

```sql
-- Xem file đầy đủ tại: docker/init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    device_info JSONB DEFAULT '{}',
    file_name TEXT,
    metadata JSONB DEFAULT '{}',
    specs JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.device_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE,
    sheet_name TEXT NOT NULL,
    sheet_data JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.activity_logs (
    id SERIAL PRIMARY KEY,
    device_id UUID REFERENCES public.devices(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_devices_user_id ON public.devices(user_id);
CREATE INDEX idx_device_sheets_device_id ON public.device_sheets(device_id);
```

</details>

---

## 🐳 Docker Deployment

<details>
<summary>🐳 Click để xem hướng dẫn Docker chi tiết</summary>

### Chạy toàn bộ stack (App + Database)

```bash
# Build và chạy tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng services
docker-compose down
```

### Chỉ chạy Database

```bash
# Chỉ khởi chạy PostgreSQL
docker-compose up -d db
```

### Docker Services

| Service | Container | Port | Mô tả |
|---|---|---|---|
| `app` | `device-dashboard-app` | `3000` | Next.js application |
| `db` | `device-dashboard-db` | `5432` | PostgreSQL 15 Alpine |

### Kết nối Database trực tiếp

```bash
# psql
docker exec -it device-dashboard-db psql -U postgres -d device_dashboard

# Connection string
postgresql://postgres:postgres@localhost:5432/device_dashboard
```

### Volumes

| Volume | Đường dẫn | Mục đích |
|---|---|---|
| DB Data | `./docker/data` | Dữ liệu PostgreSQL persistent |
| Init SQL | `./docker/init.sql` | Script khởi tạo database |

</details>

---

## ⚙️ Environment Variables

<details>
<summary>🔑 Click để xem danh sách biến môi trường</summary>

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

| Biến | Bắt buộc | Mô tả | Ví dụ |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL dự án Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon/Public key | `eyJhbGciOi...` |
| `DATABASE_URL` | ❌ | Connection string (cho Drizzle) | `postgresql://postgres:postgres@localhost:54322/postgres` |
| `PORT` | ❌ | Port chạy app | `3000` |
| `NODE_ENV` | ❌ | Môi trường | `development` / `production` |

> 💡 **Tip:** Lấy `SUPABASE_URL` và `SUPABASE_ANON_KEY` từ **Supabase Dashboard > Project Settings > API**.

</details>

---

## 📄 License

Dự án được phân phối theo giấy phép [MIT](./License.md).

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: thêm tính năng mới"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

> **Note:** Dự án đang trong giai đoạn phát triển tích cực. Mọi đóng góp và góp ý đều được chào đón! 🚀
