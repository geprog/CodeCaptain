import { forgeSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';
import { getForgeFromDB } from '~/server/forges';
import { randomBytes } from 'crypto';

export default defineEventHandler(async (event) => {
  console.log('login');

  const { forgeId } = getQuery<{ forgeId: string }>(event);
  if (!forgeId) {
    console.log('Missing forgeId query parameter');
    throw createError({
      status: 400,
      message: 'Missing forgeId query parameter',
    });
  }

  const forgeModel = await db
    .select()
    .from(forgeSchema)
    .where(eq(forgeSchema.id, parseInt(forgeId)))
    .get();

  if (!forgeModel) {
    console.log(`Forge with id ${forgeId} not found`);

    throw createError({
      status: 404,
      message: `Forge with id ${forgeId} not found`,
    });
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
