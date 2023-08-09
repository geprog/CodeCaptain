import { getUserFromCookie } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await getUserFromCookie(event);

  return user;
});
