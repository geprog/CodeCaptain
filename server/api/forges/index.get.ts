import { eq } from 'drizzle-orm';
import { forgeSchema } from '../../schemas';

export default defineEventHandler(async (event) => {
  const forges = await db.select().from(forgeSchema).where(eq(forgeSchema.allowLogin, true)).all();

  // use map to hide client id and secret
  return forges.map((forge) => ({ id: forge.id, name: forge.name, host: forge.host, type: forge.type }));
});
