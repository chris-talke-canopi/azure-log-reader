CREATE TABLE `reference` (
	`id` integer PRIMARY KEY NOT NULL,
	`tenantId` integer NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`metadata` text DEFAULT '{}' NOT NULL,
	`date` text DEFAULT (CURRENT_DATE),
	FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tenant` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`tenant_version` text,
	`tenant_id` text,
	`tenant_key` text,
	`date` text DEFAULT (CURRENT_DATE)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_name_unique` ON `tenant` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tenant_tenant_id_unique` ON `tenant` (`tenant_id`);