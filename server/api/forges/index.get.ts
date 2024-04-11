import { and, eq } from 'drizzle-orm';
import { forgeSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const forges = await db.select().from(forgeSchema).where(eq(forgeSchema.owner, user.id)).all();

  // use map to hide client id and secret
  return forges.map((forge) => ({
    id: forge.id,
    owner: forge.owner,
    host: forge.host,
    type: forge.type,
    allowLogin: forge.allowLogin,
  }));
});
