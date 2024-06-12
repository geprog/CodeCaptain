import { z } from 'zod';
import { orgMemberSchema, orgSchema } from '~/server/schemas';

export default defineEventHandler(async (event) => {
  const user = await requireUser(event);

  const orgData = await readValidatedBody(
    event,
    z.object({ name: z.string().min(3), openAIToken: z.string() }).parseAsync,
  );

  const org = await db
    .insert(orgSchema)
    .values({ name: orgData.name, openAIToken: orgData.openAIToken })
    .returning()
    .get();

  await db.insert(orgMemberSchema).values({ orgId: org.id, userId: user.id, role: 'admin' }).execute();

  return org;
});
