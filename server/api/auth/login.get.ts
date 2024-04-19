import { forgeSchema } from '~/server/schemas';
import { eq } from 'drizzle-orm';
import { getForgeFromDB } from '~/server/forges';
import { randomBytes } from 'crypto';

export default defineEventHandler(async (event) => {
  const { forgeId, redirectUrl } = getQuery<{ forgeId: string; redirectUrl?: string }>(event);
  if (!forgeId) {
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
    throw createError({
      status: 404,
      message: `Forge with id ${forgeId} not found`,
    });
  }

  const forge = getForgeFromDB(forgeModel);

  const stateId = randomBytes(64).toString('hex');

  if (redirectUrl && !redirectUrl.startsWith('/')) {
    throw createError({
      status: 400,
      message: 'Invalid redirectUrl parameter',
    });
  }

  await useStorage().setItem(`oauth:${stateId}`, {
    loginToForgeId: forgeModel.id,
    redirectUrl,
  });

  const config = useRuntimeConfig();
  const redirectUri = `${config.public.APP_URL}/api/auth/callback`;
  return sendRedirect(event, forge.getOauthRedirectUrl({ state: stateId, redirectUri }));
});
