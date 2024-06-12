import type { H3Event } from 'h3';
import {
  type User,
  forgeSchema,
  repoSchema,
  userForgesSchema,
  userSchema,
  orgReposSchema,
  orgMemberSchema,
  orgSchema,
} from '../schemas';
import { and, eq } from 'drizzle-orm';
import { getForgeFromDB, ForgeApi } from '~/server/forges';

export type AuthSession = {
  userId: number;
};

export async function useAuthSession(event: H3Event) {
  const sessionConfig = useRuntimeConfig().auth || {};
  return await useSession<AuthSession>(event, sessionConfig);
}

export async function getUser(event: H3Event): Promise<User | undefined> {
  const session = await useAuthSession(event);
  if (!session.data?.userId) {
    return undefined;
  }

  return await db.select().from(userSchema).where(eq(userSchema.id, session.data.userId)).get();
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
    accessTokenExpiresAt: userForge.accessTokenExpiresAt,
  };

  const forge = getForgeFromDB(forgeModel);
  return new ForgeApi({ ...user, tokens }, forge);
}

export async function requireAccessToRepo(user: User, repoId: number, role?: 'admin' | 'member') {
  const res = await db
    .select()
    .from(repoSchema)
    .innerJoin(orgReposSchema, eq(orgReposSchema.repoId, repoSchema.id))
    .innerJoin(orgMemberSchema, eq(orgMemberSchema.orgId, orgReposSchema.orgId))
    .where(and(eq(orgMemberSchema.userId, user.id), eq(repoSchema.id, repoId)))
    .get();

  if (!res) {
    throw createError({
      statusCode: 404,
      message: 'Repo not found',
    });
  }

  if (role && res.orgMembers.role !== role) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    });
  }

  return res.repos;
}

export async function requireAccessToOrg(user: User, orgId: number, role?: 'admin' | 'member') {
  const res = await db
    .select()
    .from(orgSchema)
    .innerJoin(orgMemberSchema, eq(orgMemberSchema.orgId, orgSchema.id))
    .where(and(eq(orgMemberSchema.userId, user.id), eq(orgSchema.id, orgId)))
    .get();

  if (!res) {
    throw createError({
      statusCode: 404,
      message: 'Org not found',
    });
  }

  if (role && res.orgMembers.role !== role) {
    throw createError({
      statusCode: 403,
      message: 'Access denied',
    });
  }

  return res.orgs;
}
