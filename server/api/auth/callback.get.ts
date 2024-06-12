import type { H3Event } from 'h3';
import { type User, forgeSchema, userForgesSchema, userSchema } from '~/server/schemas';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB } from '~/server/forges';

async function loginUser(event: H3Event, user: User, redirectUrl: string | undefined = undefined) {
  const session = await useAuthSession(event);

  await session.update({
    userId: user.id,
  });

  return sendRedirect(event, redirectUrl ?? '/');
}

export default defineEventHandler(async (event) => {
  const authenticatedUser = await getUser(event);

  const { state } = getQuery(event);
  if (!state) {
    throw createError({
      status: 400,
      message: 'Missing state query parameter',
    });
  }

  const session = await useStorage().getItem<{ loginToForgeId: number; redirectUrl?: string }>(`oauth:${state}`);
  if (!session) {
    throw createError({
      status: 400,
      message: 'Session not found',
    });
  }

  console.log('session', session);

  const forgeId = session.loginToForgeId;

  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw createError({
      status: 404,
      message: `Forge with id ${forgeId} not found`,
    });
  }

  const forge = getForgeFromDB(forgeModel);

  const tokens = await forge.oauthCallback(event);
  const oauthUser = await forge.getUserInfo(tokens.accessToken);

  // authenticated user => update user & login
  if (authenticatedUser) {
    const user = await db
      .update(userSchema)
      .set({
        avatarUrl: oauthUser.avatarUrl,
        name: oauthUser.name,
        email: oauthUser.email,
      })
      .where(eq(userSchema.id, authenticatedUser.id))
      .returning()
      .get();

    // connect user to forge and ignore if already connected
    await db
      .insert(userForgesSchema)
      .values({
        userId: authenticatedUser.id,
        forgeId: forgeModel.id,
        remoteUserId: oauthUser.remoteUserId,
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshToken: tokens.refreshToken,
      })
      .onConflictDoUpdate({
        target: [userForgesSchema.userId, userForgesSchema.forgeId],
        set: {
          remoteUserId: oauthUser.remoteUserId,
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: tokens.accessTokenExpiresAt,
          refreshToken: tokens.refreshToken,
        },
      })
      .run();

    return loginUser(event, user, session.redirectUrl);
  }

  if (!forgeModel.allowLogin) {
    throw createError({
      status: 400,
      message: 'Login not allowed for this forge',
    });
  }

  // try to find user by its remoteUserId
  const userForge = await db
    .select()
    .from(userForgesSchema)
    .where(and(eq(userForgesSchema.forgeId, forgeModel.id), eq(userForgesSchema.remoteUserId, oauthUser.remoteUserId)))
    .get();

  // existing user => update user and login
  if (userForge) {
    const user = await db
      .update(userSchema)
      .set({
        avatarUrl: oauthUser.avatarUrl,
        name: oauthUser.name,
        email: oauthUser.email,
      })
      .where(eq(userSchema.id, userForge.userId))
      .returning()
      .get();

    await db
      .update(userForgesSchema)
      .set({
        accessToken: tokens.accessToken,
        accessTokenExpiresAt: tokens.accessTokenExpiresAt,
        refreshToken: tokens.refreshToken,
      })
      .where(eq(userForgesSchema.id, userForge.id))
      .run();

    return loginUser(event, user, session.redirectUrl);
  }

  // completely new user => create user and userForge and login
  const user = await db
    .insert(userSchema)
    .values({
      avatarUrl: oauthUser.avatarUrl,
      name: oauthUser.name,
      email: oauthUser.email,
    })
    .returning()
    .get();

  await db
    .insert(userForgesSchema)
    .values({
      userId: user.id,
      forgeId: forgeModel.id,
      remoteUserId: oauthUser.remoteUserId,
      accessToken: tokens.accessToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshToken: tokens.refreshToken,
    })
    .run();

  return loginUser(event, user, session.redirectUrl);
});
