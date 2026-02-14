# 🖥️ IT Assets Management — Device Dashboard

Ứng dụng web quản lý tài sản IT (thiết bị, phần cứng) xây dựng trên **Next.js 16** với giao diện hiện đại, hỗ trợ import dữ liệu từ file Excel, quản lý CRUD đầy đủ, drag-and-drop, undo/redo, và lưu trữ offline trên trình duyệt.

---

## ✨ Tính năng chính

| Tính năng | Mô tả |
|---|---|
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
| 🎨 **Tuỳ chỉnh giao diện** | Dark/Light mode, theme colors, customizer |
| 💾 **Lưu trữ offline** | Dữ liệu được lưu trên trình duyệt (IndexedDB) — không cần backend |

---

## 🛠️ Tech Stack

### Core

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1.1 | React framework — routing, SSR |
| [React](https://react.dev/) | 19.2.3 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.9 | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Utility-first CSS |

### UI Components

| Thư viện | Mục đích |
|---|---|
| [shadcn/ui](https://ui.shadcn.com/) (Radix UI) | Hệ thống component chính (Dialog, Dropdown, Table, Tabs, …) |
| [Lucide React](https://lucide.dev/) | Icon library |
| [Recharts](https://recharts.org/) | Biểu đồ thống kê |
| [Embla Carousel](https://www.embla-carousel.com/) | Carousel cho sheet tabs |
| [cmdk](https://cmdk.paco.me/) | Command palette / tìm kiếm nhanh |
| [Sonner](https://sonner.emilkowal.dev/) | Toast notifications |

### State & Data

| Thư viện | Mục đích |
|---|---|
| [Supabase](https://supabase.com/) | JS v2 | Backend-as-a-Service (Auth, DB, Realtime) |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Cơ sở dữ liệu chính |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.x | Type-safe ORM (Dự kiến migrate) |
| [SheetJS (xlsx)](https://sheetjs.com/) | 0.18 | Đọc/ghi file Excel |
| [@tanstack/react-table](https://tanstack.com/table) | 8.x | Bảng dữ liệu nâng cao (sort, filter, pagination) |
| [@tanstack/react-virtual](https://tanstack.com/virtual) | 3.x | Virtualized rendering cho bảng lớn |

### Interactions

| Thư viện | Mục đích |
|---|---|
| [@dnd-kit](https://dndkit.com/) | Drag-and-drop (sắp xếp tabs) |
| [react-dropzone](https://react-dropzone.js.org/) | Kéo thả file upload |
| [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | Panels có thể resize |
| [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Form validation |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/Light mode |

---

## 📁 Cấu trúc dự án

```
device-dashboard/
├── public/                  # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/          # Trang đăng nhập / đăng ký
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/   # Trang tổng quan
│   │   │   ├── devices/     # Quản lý thiết bị (CRUD)
│   │   │   ├── settings/    # Cài đặt (Appearance, Account, User)
│   │   │   └── layout.tsx   # Layout chung (Sidebar + Header)
│   │   ├── globals.css      # CSS variables, Tailwind config
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── dashboard/       # Components chính
│   │   │   ├── DeviceList.tsx          # Bảng danh sách thiết bị
│   │   │   ├── DeviceDetail.tsx        # Modal chi tiết / chỉnh sửa
│   │   │   ├── ImportDevice.tsx        # Kéo thả import file
│   │   │   ├── SheetTable.tsx          # Bảng dữ liệu sheet
│   │   │   ├── SheetSelectionDialog.tsx # Chọn sheets khi import
│   │   │   ├── CreateDeviceDialog.tsx  # Dialog tạo thiết bị mới
│   │   │   ├── HardwareOverview.tsx    # Card tổng quan phần cứng
│   │   │   └── RecentActivity.tsx      # Hoạt động gần đây
│   │   ├── ui/              # shadcn/ui components (41 files)
│   │   ├── carousel/        # Sheet tabs carousel
│   │   └── theme-customizer/ # Theme customization
│   ├── stores/              # Zustand stores
│   │   ├── useDeviceStore.ts   # Device state + undo/redo
│   │   └── useAppearanceStore.ts # Theme settings
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utility functions
│   ├── config/              # App configuration
│   ├── contexts/            # React contexts
│   └── utils/               # Helper utilities
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🗄️ Lưu trữ & Backend

Ứng dụng hiện tại đã chuyển từ IndexedDB sang sử dụng **Supabase** (PostgreSQL) để đảm bảo an toàn dữ liệu và hỗ trợ nhiều người dùng.

- ✅ **Backend**: Supabase (Cloud hoặc Self-hosted)
- ✅ **Database**: PostgreSQL
- ✅ **Authentication**: Supabase Auth
- ✅ **Storage**: Supabase Storage (cho file Excel/Ảnh)

### Tuỳ chọn Deployment

Bạn có 2 cách để chạy ứng dụng:

#### 1. Sử dụng Supabase Cloud (Khuyên dùng)

- Tạo project tại [supabase.com](https://supabase.com)
- Lấy `SUPABASE_URL` và `SUPABASE_ANON_KEY`
- Cập nhật file `.env.local`

#### 2. Self-hosting với Docker (Dành cho Dev/Community)

Dự án đi kèm cấu hình Docker để bạn tự host Database riêng.

```bash
# 1. Khởi chạy Database (PostgreSQL)
docker-compose up -d

# 2. Cấu hình .env
# Copy .env.docker sang .env và cập nhật thông tin kết nối
cp .env.docker .env
```

> **Lưu ý quan trọng**: Code hiện tại sử dụng `supabase-js`, nên để chạy local hoàn toàn ("Clone & Run"), bạn cần một instance Supabase local (sử dụng `npx supabase start`) hoặc refactor lại layer kết nối dữ liệu sang Drizzle ORM để kết nối trực tiếp vào container Postgres thuần.

---

## 🚀 Bắt đầu

### Yêu cầu

- **Node.js** >= 18.x ([tải tại đây](https://nodejs.org/))
- **Docker** (nếu muốn chạy self-hosted DB)

### Cài đặt

```bash
# Clone repository
git clone https://github.com/zaza04/IT_Asset_Management.git
cd device-dashboard

# Cài đặt dependencies
npm install

# Setup biến môi trường
cp .env.example .env.local
# Điền thông tin Supabase vào .env.local
```

### Chạy Development Server

```bash
npm run dev
```

Truy cập [http://localhost:3000](http://localhost:3000).

---

## 📄 License

Dự án được phân phối theo giấy phép [MIT](./License.md).

Dự án được phân phối theo giấy phép [MIT](./License.md).

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m "feat: thêm tính năng mới"`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

> **Note:** Dự án đang trong giai đoạn phát triển. Mọi đóng góp và góp ý đều được chào đón!
