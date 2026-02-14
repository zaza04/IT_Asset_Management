import { pgTable, text, timestamp, boolean, jsonb, serial, uuid } from "drizzle-orm/pg-core";

// ⚠️ Note: auth.users is managed by Supabase, we create a public.profiles table to link extras
export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("user_id").notNull(), // Links to auth.users.id
    email: text("email").notNull(),
    role: text("role").default("user"), // 'admin' | 'user'
    fullName: text("full_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const devices = pgTable("devices", {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    code: text("code").unique(), // Asset Code (e.g. LAP-001)
    name: text("name").notNull(),
    type: text("type").notNull(), // Laptop, PC, Monitor...
    status: text("status").notNull().default("active"),
    specs: jsonb("specs").default({}), // Flexible JSON for varied hardware specs
    ownerId: uuid("owner_id").references(() => profiles.id), // Assigned to user
    location: text("location"),
    purchaseDate: timestamp("purchase_date"),
    warrantyExp: timestamp("warranty_exp"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const logs = pgTable("activity_logs", {
    id: serial("id").primaryKey(),
    deviceId: uuid("device_id").references(() => devices.id),
    userId: uuid("user_id").references(() => profiles.id),
    action: text("action").notNull(), // 'create', 'update', 'delete', 'assign'
    details: text("details"),
    timestamp: timestamp("created_at").defaultNow().notNull(),
});
