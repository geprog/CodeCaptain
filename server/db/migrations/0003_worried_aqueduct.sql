ALTER TABLE userForges ADD `accessToken` text;--> statement-breakpoint
ALTER TABLE userForges ADD `refreshToken` text;--> statement-breakpoint
ALTER TABLE userForges ADD `refreshTokenExpires` integer;