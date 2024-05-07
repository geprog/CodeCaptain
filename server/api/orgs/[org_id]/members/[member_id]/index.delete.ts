import { and, eq, inArray } from 'drizzle-orm';
import { chatMessageSchema, chatSchema, orgMemberSchema, orgReposSchema } from '~/server/schemas';

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

  await db.delete(orgMemberSchema).where(and(eq(orgMemberSchema.id, memberId), eq(orgMemberSchema.orgId, org.id)));

  // delete all chats and chat messages of the member
  const orgRepos = await db.select().from(orgReposSchema).where(eq(orgReposSchema.orgId, org.id)).all();

  const deletedChats = await db
    .delete(chatSchema)
    .where(
      and(
        inArray(
          chatSchema.repoId,
          orgRepos.map((r) => r.repoId),
        ),
        eq(chatSchema.userId, memberId),
      ),
    )
    .returning()
    .all();

  await db.delete(chatMessageSchema).where(
    inArray(
      chatMessageSchema.chatId,
      deletedChats.map((c) => c.id),
    ),
  );

  return 'ok';
});
