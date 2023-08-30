import { sqliteTable, text, integer, unique } from 'drizzle-orm/sqlite-core';
import { InferSelectModel } from 'drizzle-orm';

export const userSchema = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
  avatarUrl: text('avatarUrl'),
  email: text('email'),
});
export type User = InferSelectModel<typeof userSchema>;

export const forgeSchema = sqliteTable('forges', {
  id: integer('id').primaryKey(),
  type: text('type').notNull(), // github, gitlab, gitea, bitbucket, etc
  host: text('host').unique().notNull(),
  owner: integer('owner'),
  allowLogin: integer('allowLogin', { mode: 'boolean' }),
  clientId: text('clientId').notNull(),
  clientSecret: text('clientSecret').notNull(),
});
export type Forge = InferSelectModel<typeof forgeSchema>;

export const userForgesSchema = sqliteTable('userForges', {
  id: integer('id').primaryKey(),
  userId: integer('userId').notNull(),
  forgeId: integer('forgeId').notNull(),
  remoteUserId: text('remoteUserId').notNull(),
  accessToken: text('accessToken').notNull(),
  accessTokenExpiresIn: integer('accessTokenExpiresIn').notNull(),
  refreshToken: text('refreshToken'),
});

export const repoSchema = sqliteTable(
  'repos',
  {
    id: integer('id').primaryKey(),
    forgeId: integer('forgeId').notNull(),
    remoteId: text('remoteId').notNull(),
    name: text('name').notNull(),
    url: text('url').notNull(),
    cloneUrl: text('cloneUrl').notNull(),
    lastFetch: integer('lastIndex', { mode: 'timestamp' }),
  },
  (table) => ({
    forgeRemoteId: unique('uniqueForgeRemoteId').on(table.forgeId, table.remoteId),
  }),
);

export type RepoFromDB = InferSelectModel<typeof repoSchema>;

export const userReposSchema = sqliteTable('userRepos', {
  id: integer('id').primaryKey(),
  userId: integer('userId').notNull(),
  repoId: integer('repoId').notNull(),
});
