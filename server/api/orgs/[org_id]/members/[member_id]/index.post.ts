import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { orgMemberSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgId = getRouterParam(event, 'org_id');
  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'org_id is required',
    });
  }

  const _memberId = getRouterParam(event, 'member_id');
  if (!_memberId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'member_id is required',
    });
  }
  const memberId = parseInt(_memberId, 10);

  const org = await requireAccessToOrg(user, parseInt(orgId, 10), 'admin');

  const admins = await db
    .select()
    .from(orgMemberSchema)
    .where(and(eq(orgMemberSchema.orgId, org.id), eq(orgMemberSchema.role, 'admin')))
    .all();

  // check at least one admin is remains
  if (admins.filter((m) => m.id !== memberId).length < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one admin is required',
    });
  }

  const memberData = await readValidatedBody(
    event,
    z.object({
      role: z.string(),
    }).parseAsync,
  );

  if (!memberData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'role is required',
    });
  }

  const updatedMember = await db
    .update(orgMemberSchema)
    .set({ role: memberData.role as 'admin' | 'member' })
    .where(and(eq(orgMemberSchema.id, memberId), eq(orgMemberSchema.orgId, org.id)))
    .returning()
    .get();

  return updatedMember;
});
