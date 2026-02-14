# Detailed Project Plan: Supabase Integration & Vercel Deployment

## 1. Objective

Replace the current in-memory mock data and manual JWT authentication with a production-ready **Supabase** backend (PostgreSQL + Auth), then deploy the full application to **Vercel**.

## 2. Phase 1: Database Foundation (Core Infrastructure)

*Goal: Establish a connection to the Supabase PostgreSQL database using Drizzle ORM.*

- [x] **Install Dependencies**: `drizzle-orm`, `postgres`, `dotenv`, `drizzle-kit` (Done).
- [x] **Config Environment**:
  - User creates `.env.local` file.
  - Add `DATABASE_URL` (Transaction Pooler - Port 6543).
  - Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [x] **Drizzle Setup**:
  - Create `drizzle.config.ts`: Configuration for migration tools.
  - Create `src/db/drizzle.ts`: Database client initialization.
- [x] **Schema Definition (`src/db/schema.ts`)**:
  - Define `users` table (linked to `auth.users`).
  - Define `devices` table.
- [x] **Apply Schema**:
  - Run `npx drizzle-kit push` to create tables in Supabase.

## 3. Phase 2: Authentication (Supabase Auth)

*Goal: Secure the application using Supabase's built-in authentication system.*

- [x] **Install Auth Helpers**: `npm install @supabase/ssr @supabase/supabase-js`.
- [x] **Auth Utilities**:
  - Create `src/utils/supabase/server.ts`, `client.ts`, `middleware.ts`.
- [x] **Update Middleware (`src/middleware.ts`)**:
  - Replace `jose` JWT logic with `updateSession` from Supabase.
  - Protect `/devices` routes.
- [x] **Refactor Login/Signup**:
  - Create `src/app/(auth)/sign-up/page.tsx` (Sign Up with Username).
  - Create `src/app/(auth)/sign-in/page.tsx` (Sign In with Username).
  - Remove hardcoded `admin/admin` logic.

## 4. Phase 3: Data Migration & Seeding

*Goal: Move existing mock data into the real database.*

- [ ] **Create Seed Script (`src/db/seed.ts`)**:
  - Import existing mock data from `src/lib/mock-data.ts`.
  - Loop through data and insert into `devices` table using Drizzle.
- [ ] **Execute Seed**: Run the script manually to populate the DB.

## 5. Phase 4: API Refactoring

*Goal: Connect the frontend to the real database.*

- [ ] **Device List API (`src/app/api/devices/route.ts`)**:
  - GET: `db.select().from(devices)`.
  - POST: `db.insert(devices).values(...)`.
- [ ] **Device Detail API (`src/app/api/devices/[id]/route.ts`)**:
  - GET/PUT/DELETE logic using Drizzle.
- [ ] **Frontend Hooks**:
  - Review `useDeviceStore` to ensure it fetches from the updated APIs.

## 6. Phase 5: Production Deployment

*Goal: Go live on Vercel.*

- [ ] **Github**: Ensure all code is pushed to the `main` branch.
- [ ] **Vercel Project**:
  - Import repository.
  - **Crucial**: Add Environment Variables in Vercel Settings (copy from `.env.local`).
- [ ] **Deploy**: Trigger deployment and verify URL.

## 7. Verification Checklist

- [ ] **Login**: User can sign in with Supabase credentials.
- [ ] **Persistence**: Data survives page reloads and redeploys.
- [ ] **Performance**: Dashboard loads quickly (using proper indexing).
- [ ] **Security**: RLS policies prevent unauthorized access (if applicable).
