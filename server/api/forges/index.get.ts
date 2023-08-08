import { eq } from 'drizzle-orm';
import { forgeSchema } from '../../schemas';
import { getForgeFromDB } from '../../forges';

export default defineEventHandler(async (event) => {
  const forges = await db.select().from(forgeSchema).where(eq(forgeSchema.allowLogin, true)).all();

  return forges.map((forge) => {
    const oauthRedirectUrl = getForgeFromDB(forge).getOauthRedirectUrl();
    return { ...forge, oauthRedirectUrl };
  });
});
