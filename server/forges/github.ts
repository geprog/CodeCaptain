import type { H3Event } from 'h3';
import { Forge, UserInfo, Credentials, Tokens } from './types';
import { User, Forge as DBForge } from '../schemas';
import { Octokit } from 'octokit';

export class Github extends Forge {
  private clientId: string;
  private clientSecret: string;

  constructor(forge: DBForge) {
    super();
    this.clientId = forge.clientId;
    this.clientSecret = forge.clientSecret;
  }

  private getClient(token: string) {
    return new Octokit({
      auth: token,
    });
  }

  public async getCloneCredentials(todo: unknown): Promise<Credentials> {
    return {
      username: 'oauth',
      password: 'todo-token',
    };
  }

  public getOauthRedirectUrl({ state }: { state: string }): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=public_repo&state=${state}`;
  }

  public async oauthCallback(event: H3Event): Promise<UserInfo> {
    const tokens = await this.getTokens(event);

    const token = tokens.accessToken;

    const client = this.getClient(token);

    const githubUser = await client.request('GET /user');

    return {
      name: githubUser.data.name || undefined,
      avatarUrl: githubUser.data.avatar_url || undefined,
      email: githubUser.data.email || undefined,
      remoteUserId: githubUser.data.id.toString(),
      tokens 
    };
  }

  public async getTokens(event: H3Event): Promise<Tokens> {
    const { code } = getQuery(event);

    if (!code) {
      throw new Error('No code provided');
    }
    const response: any = await $fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
      },
    });

    if (response.error) {
      console.error(response.error);
      throw new Error('Error getting access token');
    }
    return {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      rtExpires: response.refresh_token_expires_in,
    };
  }
}
