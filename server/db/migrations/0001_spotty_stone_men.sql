CREATE TABLE `forges` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`type` text NOT NULL,
	`host` text,
	`clientId` text NOT NULL,
	`clientSecret` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userForges` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`forgeId` integer NOT NULL,
	`remoteUserId` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `login`;