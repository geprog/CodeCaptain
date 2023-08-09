import { H3Event } from 'h3';

export abstract class Forge {
  public abstract getCloneCredentials(todo: unknown): Promise<{
    username: string;
    password: string;
  }>;
  public abstract oauthCallback(event: H3Event): Promise<{
    name?: string;
    avatarUrl?: string;
    email?: string;
    remoteUserId: string;
  }>;
  public abstract getOauthRedirectUrl(o: { state: string }): string;
}
