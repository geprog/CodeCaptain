import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '~/server/utils/db';
import { forgeSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';
import path from 'path';

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();

  console.log('Migrating database ...');

  // const migrationsStorage = useStorage('root/server/database/migrations');
  // let migrationFiles = await migrationsStorage.getKeys();
  // migrationFiles = migrationFiles.filter((key) => key.endsWith('.sql'));

  // // Make sure to create the _hub_migrations table if it doesn't exist
  // await db
  //   .prepare(
  //     'CREATE TABLE IF NOT EXISTS _hub_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, created_at INTEGER NOT NULL)',
  //   )
  //   .run();

  // // Get applied migrations from database
  // const hubMigrations = await db.prepare('SELECT * FROM _hub_migrations').all();
  // const appliedMigrations = (hubMigrations.results || []).map((row) => row.name);
  // const missingMigrations = migrationFiles.filter((file) => !appliedMigrations.includes(file));
  // if (!missingMigrations.length) {
  //   consola.success('Database up-to-date and ready');
  //   return;
  // }

  // // Apply missing migrations
  // const appliedMigrationsStmts = [];
  // for (const file of missingMigrations) {
  //   consola.info(`Applying database migrations from ${file}...`);
  //   const migration = (await migrationsStorage.getItem<string>(file)) || '';
  //   const statements = migration.split('--> statement-breakpoint');
  //   for (let stmt of statements) {
  //     await database.prepare(stmt.trim()).run();
  //   }
  //   appliedMigrationsStmts.push(
  //     database.prepare('INSERT INTO _hub_migrations (name, created_at) VALUES (?, ?)').bind(file, Date.now()),
  //   );
  // }
  // await database.batch(appliedMigrationsStmts);
  // consola.success('Database migrations done');

  migrate(db, { migrationsFolder: config.migrations_path });

  console.log('Seeding database ...');

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const forge = await db.select().from(forgeSchema).where(eq(forgeSchema.type, 'github')).get();
    await db
      .insert(forgeSchema)
      .values({
        id: forge?.id,
        host: 'github.com',
        type: 'github',
        owner: null,
        allowLogin: true,
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
      .onConflictDoUpdate({
        target: forgeSchema.id,
        set: {
          host: 'github.com',
          owner: null,
          allowLogin: true,
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      })
      .run();
    if (forge) {
      console.log('Updated github forge');
    } else {
      console.log('Seeded github forge');
    }
  } else {
    console.log('No GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET provided, skipping github forge seeding');
  }
});
