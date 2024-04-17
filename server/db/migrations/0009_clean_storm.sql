CREATE TABLE `chatMessages` (
	`id` integer PRIMARY KEY NOT NULL,
	`chatId` integer NOT NULL,
	`from` text NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`repoId` integer NOT NULL,
	`name` text NOT NULL,
	`createdAt` integer NOT NULL
);
