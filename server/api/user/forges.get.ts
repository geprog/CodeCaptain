import { eq } from 'drizzle-orm';
import { forgeSchema, userForgesSchema } from '../../schemas';
import { getForgeFromDB } from '../../forges';
import { getUserFromCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromCookie(event);
  if (!user) {
    return [];
    // return sendError(event, createError({ statusCode: 401, cause: 'Unauthorized' }));
  }

  // TODO: filter by forges the user has access to?
  const userForges = await db.select().from(userForgesSchema).where(eq(userForgesSchema.userId, user.id)).all();
  const forges = await db.select().from(forgeSchema).all();

  return forges.map((forge) => {
    const oauthRedirectUrl = getForgeFromDB(forge).getOauthRedirectUrl();
    const isConnected = userForges.some((userForge) => userForge.forgeId === forge.id);
    return { ...forge, oauthRedirectUrl, isConnected };
  });
});
