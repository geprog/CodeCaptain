CREATE TABLE `forges` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`type` text NOT NULL,
	`host` text,
	`allowLogin` integer,
	`clientId` text NOT NULL,
	`clientSecret` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `repos` (
	`id` integer PRIMARY KEY NOT NULL,
	`forgeId` integer NOT NULL,
	`remoteId` text NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`cloneUrl` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userForges` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`forgeId` integer NOT NULL,
	`remoteUserId` text NOT NULL,
	`accessToken` text NOT NULL,
	`accessTokenExpiresIn` integer NOT NULL,
	`refreshToken` text
);
--> statement-breakpoint
CREATE TABLE `userRepos` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`repoId` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`avatarUrl` text,
	`email` text
);
