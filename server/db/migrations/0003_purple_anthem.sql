CREATE UNIQUE INDEX `forges_host_unique` ON `forges` (`host`);--> statement-breakpoint
ALTER TABLE `forges` DROP COLUMN `name`;