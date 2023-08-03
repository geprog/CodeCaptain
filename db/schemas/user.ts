import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';


export const userSchema = sqliteTable('users',{
    id: integer('id').primaryKey(),
    loginName: text('login'),
    name: text('name'),
    avatarUrl: text('avatarUrl'),
    email: text('email'),
});