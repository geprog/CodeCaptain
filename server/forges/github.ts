import type { H3Event } from 'h3';
import { Forge, Credentials, Tokens, ForgeUser } from './types';
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

  public getClientSecrect(): string {
    return this.clientSecret;
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

  public async getUserInfo(token: string): Promise<ForgeUser> {
    const client = this.getClient(token);
    const githubUser = await client.request('GET /user');

    return {
      name: githubUser.data.name,
      avatarUrl: githubUser.data.avatar_url,
      email: githubUser.data.email,
      remoteUserId: githubUser.data.id.toString(),
    };
  }

  public async oauthCallback(event: H3Event): Promise<Tokens> {
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
    };
  }
}
