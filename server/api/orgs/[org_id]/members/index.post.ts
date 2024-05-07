import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { orgMemberSchema, userSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgId = getRouterParam(event, 'org_id');
  if (!orgId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'org_id is required',
    });
  }

  const org = await requireAccessToOrg(user, parseInt(orgId, 10), 'admin');

  const memberData = await readValidatedBody(
    event,
    z.object({
      email: z.string(),
      role: z.string(),
    }).parseAsync,
  );

  if (!memberData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'role is required',
    });
  }

  const newMember = await db.select().from(userSchema).where(eq(userSchema.email, memberData.email)).get();
  if (!newMember) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User not found',
    });
  }

  const member = await db
    .insert(orgMemberSchema)
    .values({
      orgId: org.id,
      userId: newMember.id,
      role: memberData.role as 'admin' | 'member',
    })
    .returning()
    .get();

  return member;
});
