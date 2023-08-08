import type { H3Event } from 'h3';
import { User, userSchema } from '../schemas';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

const jwtSecret = '123456789';

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
