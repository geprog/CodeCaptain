import type { H3Event } from 'h3';
import { Forge } from './types';
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

  public async getUser(forgeRemoteId: string): Promise<User> {
    const token = '123';

    const octokit = this.getClient(token);

    const githubUser = await octokit.request('GET /user');

    return {
      id: 0,
      name: githubUser.data.name,
      avatarUrl: githubUser.data.avatar_url,
      email: githubUser.data.email,
      // forgeRemoteId: githubUser.data.id.toString(),
    };
  }

  public async getCloneCredentials(todo: unknown): Promise<{
    username: string;
    password: string;
  }> {
    return {
      username: 'oauth',
      password: 'todo-token',
    };
  }

  public getOauthRedirectUrl(): string {
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&scope=public_repo`;
  }

  public async oauthCallback(
    event: H3Event,
  ): Promise<{ name?: string; avatarUrl?: string; email?: string; remoteUserId: string }> {
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

    const token = response.access_token;
    const octokit = new Octokit({ auth: token });

    const githubUser = await octokit.request('GET /user');

    return {
      name: githubUser.data.name || undefined,
      avatarUrl: githubUser.data.avatar_url || undefined,
      email: githubUser.data.email || undefined,
      remoteUserId: githubUser.data.id.toString(),
    };
  }
}
