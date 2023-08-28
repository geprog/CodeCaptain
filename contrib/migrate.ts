import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '../server/utils/db';
import { forgeSchema } from '../server/schemas';
import { eq } from 'drizzle-orm';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
dotenv.config({ path: '.env' });

async function main() {
  console.log('Migrating database ...');
  migrate(db, { migrationsFolder: process.env.MIGRATIONS_PATH || path.join('server', 'db', 'migrations') });

  console.log('Seeding database ...');

  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    const forge = await db.select().from(forgeSchema).where(eq(forgeSchema.type, 'github')).get();
    await db
      .insert(forgeSchema)
      .values({
        id: forge?.id,
        name: 'Github',
        type: 'github',
        allowLogin: true,
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
      .onConflictDoUpdate({
        target: forgeSchema.id,
        set: {
          name: 'Github',
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
}

main();
