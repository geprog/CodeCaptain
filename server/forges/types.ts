import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';

export type Tokens = { accessToken: string; refreshToken: string };
export type Credentials = {
  username: string;
  password: string;
};
export type UserInfo = {
  name?: string;
  avatarUrl?: string;
  email?: string;
  remoteUserId: string;
  tokens: Tokens;
};
type TokenState = 'valid' | 'expired' | 'invalid';

function verifyJWT(token: string, secret: string): TokenState {
  try {
    jwt.verify(token, secret);
    return 'valid';
  } catch (error) {
    if (error.name == 'TokenExpiredError') {
      return 'expired';
    }
    return 'invalid';
  }
}

export abstract class Forge {
  public abstract getClientSecrect(): string;
  public abstract getCloneCredentials(todo: unknown): Promise<Credentials>;
  public abstract getOauthRedirectUrl(o: { state: string }): string;
  public abstract requestOauthTokens(event: H3Event, refreshToken?: string): Promise<Tokens>;
  public abstract getUserInfo(tokens: Tokens): Promise<UserInfo>;

  public async oauthCallback(event: H3Event, tokens: Tokens): Promise<UserInfo> {
    const tokenState = verifyJWT(tokens.accessToken, this.getClientSecrect());

    let validTokens:Tokens = {
      accessToken: '',
      refreshToken: ''
    };

    switch (tokenState) {
      case 'expired':
        validTokens = await this.requestOauthTokens(event, tokens.refreshToken);
        break;
      case 'invalid':
        validTokens = await this.requestOauthTokens(event);
        break;
      case 'valid':
        validTokens = tokens;
        break;
    }

    const userInfo = await this.getUserInfo(validTokens);

    return userInfo;
  }
}
