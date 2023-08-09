import { H3Event } from 'h3';

export type Tokens = {accessToken: string, refreshToken: string, rtExpires?: number}
export type Credentials = {
  username: string;
  password: string;
}
export type UserInfo = {
  name?: string;
  avatarUrl?: string;
  email?: string;
  remoteUserId: string;
  tokens: Tokens;
}

export abstract class Forge {
  public abstract getCloneCredentials(todo: unknown): Promise<Credentials>;
  public abstract oauthCallback(event: H3Event): Promise<UserInfo>;
  public abstract getOauthRedirectUrl(o: { state: string }): string;
}
