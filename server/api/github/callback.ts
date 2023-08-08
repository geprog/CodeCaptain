import { Octokit } from 'octokit';
import { userSchema } from '../../schemas';
import {eq, InferModel} from 'drizzle-orm';

const config = useRuntimeConfig();

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);
  type User = InferModel<typeof userSchema>;

  if (!code) {
    return sendRedirect(event, '/');
  }
  const response: any = await $fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    body: {
      client_id: config.public.github.clientId,
      client_secret: config.github.clientSecret,
      code,
    },
  });

  if (response.error) {
    return sendRedirect(event, '/');
  }

  const token = response.access_token;
  const octokit = new Octokit({ auth: token });

  const user = await octokit.request('GET /user');

  const userExisting: User[] = await db.select().from(userSchema).where(eq(userSchema.forgeRemoteId, user.data.id))

  if (userExisting.length > 0){
    return sendRedirect(event, '/');
  }
  
  const createdUser = await db
    .insert(userSchema)
    .values({
      id: user.data.id,
      loginName: user.data.login,
      name: user.data.name,
      avatarUrl: user.data.avatar_url,
      email: user.data.email,
    })
    .onConflictDoNothing({ target: userSchema.forgeRemoteId })
    .run();
    console.log(createdUser)
  // TODO: set cookie using jwt-token etc instead of plain token
  setCookie(event, 'gh_token', token, { path: '/' });

  return sendRedirect(event, '/');
});
