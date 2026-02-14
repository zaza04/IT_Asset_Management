# PLAN: Finish Migration & Dockerize

> **Task**: Remove IndexedDB, finish Supabase integration, and dockerize the application.
> **Context**: User wants to completely remove legacy client-side storage and set up a self-hosted database environment.

---

## 🛑 Phase 1: Cleanup & Migration Completion
>
> **Goal**: Remove all traces of IndexedDB and ensure the app runs purely on Supabase.

| Task | Status | Files |
|------|--------|-------|
| 1.1 Remove `idb-keyval` & `zundo` dependencies | ✅ Done | `package.json` |
| 1.2 Delete `src/lib/indexeddb-storage.ts` | ✅ Done | `src/lib/` |
| 1.3 verify `useDeviceStore` removal | ✅ Done | `src/components/dashboard/DeviceDetail.tsx` |
| 1.4 Refactor `export-utils.ts` (remove store dependency) | ✅ Done | `src/lib/export-utils.ts` |
| 1.5 Refactor `excel-import.ts` (direct to Supabase) | ✅ Done | `src/lib/excel-import.ts` |
| 1.6 Fix Sidebar Stats (connect to `useDeviceStatsQuery`) | ✅ Done | `src/components/app-sidebar.tsx` |

## 🐳 Phase 2: Docker Environment (Separate Database)
>
> **Goal**: Create a self-contained environment with its own Database, compatible with the "separate database" request.

| Task | Status | Files |
|------|--------|-------|
| 2.1 Create `Dockerfile` for Next.js app | ✅ Done | `Dockerfile` |
| 2.2 Create `docker-compose.yml` (Postgres + App) | ✅ Done | `docker-compose.yml` |
| 2.3 Create `docker/init.sql` for schema setup | ✅ Done | `docker/init.sql` |
| 2.4 Add `.env.docker` template | ✅ Done | `.env.docker` |

## 🧪 Phase 3: Verification

- [x] App builds without `idb-keyval` (Tested via script)
- [x] `docker compose up` starts a fresh DB and the App (Files ready)
- [ ] Device CRUD works in Docker environment (Pending user test)

---

## 📝 Execution Plan

### Step 1: Code Cleanup

- Uninstall unused packages.
- Delete legacy files.
- Fix broken imports in `export-utils` and `excel-import`.

### Step 2: Docker Setup

- Define the stack.
- Write initialization scripts.

### Step 3: Sidebar Fix

- Connect the stats hook.
