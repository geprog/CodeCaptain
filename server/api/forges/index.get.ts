import { eq } from 'drizzle-orm';
import { forgeSchema } from '../../schemas';

export default defineEventHandler(async (event) => {
  const forges = await db.select().from(forgeSchema).where(eq(forgeSchema.allowLogin, true)).all();
  return forges;
});
