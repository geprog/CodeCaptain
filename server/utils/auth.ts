import type { H3Event } from 'h3';
import { User, forgeSchema, repoSchema, userForgesSchema, userReposSchema, userSchema } from '../schemas';
import jwt from 'jsonwebtoken';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB, ForgeApi } from '../forges';

const jwtSecret = '123456789'; // TODO: move to nuxt settings

export async function getUser(event: H3Event): Promise<User | undefined> {
  const userToken = parseCookies(event).token;
  if (!userToken) {
    return undefined;
  }

  const { userId } = jwt.verify(userToken, jwtSecret) as { userId: number };

  return await db.select().from(userSchema).where(eq(userSchema.id, userId)).get();
}

export async function requireUser(event: H3Event): Promise<User> {
  const user = await getUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  return user;
}

export function setUserCookie(event: H3Event, user: User) {
  const token = jwt.sign(
    {
      userId: user.id,
    },
    jwtSecret,
    { expiresIn: '1h' },
  );

  setCookie(event, 'token', token);

  return sendRedirect(event, '/');
}

export async function getUserForgeAPI(user: User, forgeId: number) {
  const userForge = await db
    .select()
    .from(userForgesSchema)
    .where(and(eq(userForgesSchema.userId, user.id), eq(userForgesSchema.forgeId, forgeId)))
    .get();
  if (!userForge) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access to forge denied',
    });
  }

  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Forge not found',
    });
  }

  const tokens = {
    accessToken: userForge.accessToken,
    refreshToken: userForge.refreshToken,
    accessTokenExpiresIn: userForge.accessTokenExpiresIn,
  };

  const forge = getForgeFromDB(forgeModel);
  return new ForgeApi({ ...user, tokens }, forge);
}

export async function requireAccessToRepo(user: User, repoId: number) {
  const userRepo = await db
    .select()
    .from(userReposSchema)
    .where(and(eq(userReposSchema.userId, user.id), eq(userReposSchema.repoId, repoId)))
    .get();

  if (!userRepo) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access to repo denied',
    });
  }

  const repo = await db
    .select()
    .from(repoSchema)
    .where(eq(repoSchema.id, Number(repoId)))
    .get();

  if (!repo) {
    throw createError({
      statusCode: 404,
      message: 'Repo not found',
    });
  }

  return repo;
}
