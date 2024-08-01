import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

const defaultDates = {
    created_on: text("date").default(sql`(CURRENT_DATE)`),
    updated_on: text("date").default(sql`(CURRENT_DATE)`)
};

export const tenant = sqliteTable('tenant', {
    id: integer('id').primaryKey(),
    name: text('name').unique(),
    tenant_version: text('tenant_version'),
    tenant_id: text('tenant_id').unique(),
    tenant_key: text('tenant_key'),
    ...defaultDates
})
  
export const reference = sqliteTable('reference', {
    id: integer('id').primaryKey(),
    tenantId: integer('tenantId').references(() => tenant.id).notNull(),
    name: text('name').notNull(),
    location: text('location').notNull(),
    metadata: text('metadata').notNull().default(`{}`),
    ...defaultDates
});