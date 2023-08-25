import type { H3Event } from 'h3';
import { User, forgeSchema, userForgesSchema, userReposSchema, userSchema } from '../schemas';
import jwt from 'jsonwebtoken';
import { and, eq } from 'drizzle-orm';
import { getForgeApiFromDB } from '../forges';

const jwtSecret = '123456789'; // TODO: move to nuxt settings

export async function getUserFromCookie(event: H3Event) {
  const userToken = parseCookies(event).token;
  if (!userToken) {
    return undefined;
  }

  const { userId } = jwt.verify(userToken, jwtSecret) as { userId: number };

  return await db.select().from(userSchema).where(eq(userSchema.id, userId)).get();
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
    throw new Error('User forge not found');
  }

  const forgeModel = await db.select().from(forgeSchema).where(eq(forgeSchema.id, forgeId)).get();
  if (!forgeModel) {
    throw new Error('Forge not found');
  }

  const tokens = {
    accessToken: userForge.accessToken,
    refreshToken: userForge.refreshToken,
    accessTokenExpiresIn: userForge.accessTokenExpiresIn,
  };

  console.log('tokens', tokens); // TODO: check tokens

  return getForgeApiFromDB({ ...user, tokens }, forgeModel);
}

export async function requireAccessToRepo(user: User, repoId: number) {
  const userRepo = await db
    .select()
    .from(userReposSchema)
    .where(and(eq(userReposSchema.userId, user.id), eq(userReposSchema.repoId, repoId)))
    .get();
  return !!userRepo;
}
