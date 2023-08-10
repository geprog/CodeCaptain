import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import { User } from '../schemas';

export type Tokens = { accessToken: string; refreshToken: string };
export type Credentials = {
  username: string;
  password: string;
};
export type UserWithTokens = User & { tokens: Tokens };
export type ForgeUser = Omit<User, 'id'> & { remoteUserId: string };

// function verifyJWT(token: string, secret: string) {
//   try {
//     jwt.verify(token, secret);
//     return 'valid';
//   } catch (error) {
//     if (error.name == 'TokenExpiredError') {
//       return 'expired';
//     }

//     return 'invalid';
//   }
// }

export abstract class Forge {
  public abstract getClientSecrect(): string;
  public abstract getCloneCredentials(todo: unknown): Promise<Credentials>;
  public abstract getOauthRedirectUrl(o: { state: string }): string;
  public abstract getUserInfo(token: string): Promise<ForgeUser>;
  public abstract oauthCallback(event: H3Event): Promise<Tokens>;
  // public abstract refreshToken(refreshToken: string): Promise<string>;
}
