import { isNull } from 'drizzle-orm';
import { forgeSchema } from '../../schemas';

export default defineEventHandler(async (event) => {
  const forges = await db.select().from(forgeSchema).where(isNull(forgeSchema.owner)).all();

  // use map to hide client id and secret
  return forges.map((forge) => ({ id: forge.id, owner: forge.owner, host: forge.host, type: forge.type }));
});
