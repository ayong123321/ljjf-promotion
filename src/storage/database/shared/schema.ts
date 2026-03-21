import { pgTable, serial, timestamp, varchar, text, boolean, integer, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 推广者表
export const promoters = pgTable(
  "promoters",
  {
    id: serial().notNull().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    wechat: varchar("wechat", { length: 100 }),
    uniqueCode: varchar("unique_code", { length: 50 }).notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("promoters_unique_code_idx").on(table.uniqueCode),
    index("promoters_is_active_idx").on(table.isActive),
  ]
);

// 推广内容表
export const promotionContents = pgTable(
  "promotion_contents",
  {
    id: serial().notNull().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    videoUrl: text("video_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  (table) => [
    index("promotion_contents_is_active_idx").on(table.isActive),
  ]
);

// 访客记录表
export const visitorRecords = pgTable(
  "visitor_records",
  {
    id: serial().notNull().primaryKey(),
    promoterId: integer("promoter_id").notNull(),
    wechatId: varchar("wechat_id", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    referrer: text("referrer"),
    wechatStatus: varchar("wechat_status", { length: 20 }).default("未添加").notNull(),
    dealStatus: varchar("deal_status", { length: 20 }).default("未成交").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("visitor_records_promoter_id_idx").on(table.promoterId),
    index("visitor_records_created_at_idx").on(table.createdAt),
  ]
);

// 浏览统计表
export const pageViews = pgTable(
  "page_views",
  {
    id: serial().notNull().primaryKey(),
    promoterId: integer("promoter_id").notNull(),
    visitorId: integer("visitor_id"),
    viewCount: integer("view_count").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    index("page_views_promoter_id_idx").on(table.promoterId),
    index("page_views_visitor_id_idx").on(table.visitorId),
  ]
);
