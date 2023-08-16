import { H3Event } from 'h3';
import { User } from '../schemas';

export type Tokens = { accessToken: string; accessTokenExpiresIn: number; refreshToken?: string };

export type Credentials = {
  username: string;
  password: string;
};

export type UserWithTokens = User & { tokens: Tokens };

export type ForgeUser = Omit<User, 'id'> & { remoteUserId: string };

export type Repo = {
  id: string;
  name: string;
};

export interface Forge {
  getOauthRedirectUrl(o: { state: string }): string;
  refreshToken(refreshToken: string): Promise<Tokens>;
  oauthCallback(event: H3Event): Promise<Tokens>;
  getUserInfo(token: string): Promise<ForgeUser>;
  getCloneCredentials(token: string): Promise<Credentials>;
  getRepos(token: string, search?: string): Promise<Repo[]>;
  getRepo(token: string, repoId: string): Promise<Repo>;
}
