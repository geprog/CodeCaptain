import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { InferModel } from 'drizzle-orm';

export const userSchema = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  avatarUrl: text('avatarUrl'),
  email: text('email'),
});
export type User = InferModel<typeof userSchema, 'select'>;

export const forgeSchema = sqliteTable('forges', {
  id: integer('id').primaryKey(),
  name: text('name'),
  type: text('type').notNull(), // github, gitlab, gitea, bitbucket, etc
  host: text('host'),
  allowLogin: integer('allowLogin', { mode: 'boolean' }),
  clientId: text('clientId').notNull(),
  clientSecret: text('clientSecret').notNull(),
});
export type Forge = InferModel<typeof forgeSchema, 'select'>;

export const userForgesSchema = sqliteTable('userForges', {
  id: integer('id').primaryKey(),
  userId: integer('userId').notNull(),
  forgeId: integer('forgeId').notNull(),
  remoteUserId: text('remoteUserId').notNull(),
  accessToken: text('accessToken').notNull(),
  accessTokenExpiresIn: integer('accessTokenExpiresIn').notNull(),
  refreshToken: text('refreshToken'),
});

export const repoSchema = sqliteTable('repos', {
  id: integer('id').primaryKey(),
  forgeId: integer('forgeId').notNull(),
  remoteId: text('remoteId').notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  cloneUrl: text('cloneUrl').notNull(),
});

export const userReposSchema = sqliteTable('userRepos', {
  id: integer('id').primaryKey(),
  userId: integer('userId').notNull(),
  repoId: integer('repoId').notNull(),
});
