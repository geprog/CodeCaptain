import { forgeSchema } from '../../schemas';
import { eq } from 'drizzle-orm';
import { getForgeFromDB } from '../../forges';
import { randomBytes } from 'crypto';

export default defineEventHandler(async (event) => {
  const forgeId = getQuery(event).forgeId as string;
  if (!forgeId) {
    throw new Error('Forge id is undefined');
  }

  const forgeModel = await db
    .select()
    .from(forgeSchema)
    .where(eq(forgeSchema.id, parseInt(forgeId)))
    .get();

  if (!forgeModel) {
    throw new Error(`Forge with id ${forgeId} not found`);
  }

  const forge = getForgeFromDB(forgeModel);

  const stateId = randomBytes(64).toString('hex');

  await useStorage().setItem(`oauth:${stateId}`, {
    loginToForgeId: forgeModel.id,
  });

  const config = useRuntimeConfig();
  const redirectUri = `${config.public.APP_URL}/api/auth/callback`;
  return sendRedirect(event, forge.getOauthRedirectUrl({ state: stateId, redirectUri }));
});
