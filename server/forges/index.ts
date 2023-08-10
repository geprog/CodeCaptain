import { H3Event } from 'h3';
import { Gitlab } from './gitlab';
import { Forge as ForgeModel } from '../schemas';
import { Github } from './github';
import { Credentials, Forge, ForgeUser, Repo, Tokens, UserWithTokens } from './types';
import jwt from 'jsonwebtoken'; // TODO: fix type

const jwtSecret = '123'; // TODO: load from nuxt settings

class ForgeApi {
  private user: UserWithTokens;
  private forge: Forge;

  constructor(user: UserWithTokens, forge: Forge) {
    this.user = user;
    this.forge = forge;
  }

  private async verifyJWT<T>(token: string, secret: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      jwt.verify(token, secret, (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded);
        }
      });
    });
  }

  private async refreshTokenIfNeeded(user: UserWithTokens): Promise<Tokens> {
    const decoded = await this.verifyJWT<{ exp: number }>(user.tokens.accessToken, jwtSecret);
    if (decoded.exp * 1000 > Date.now()) {
      return user.tokens;
    }
    const newTokens = await this.forge.refreshToken(user.tokens.refreshToken);
    user.tokens = newTokens;

    // TODO: update user tokens in db

    return newTokens;
  }

  public async getCloneCredentials(): Promise<Credentials> {
    const { accessToken } = await this.refreshTokenIfNeeded(this.user);

    return this.forge.getCloneCredentials(accessToken);
  }

  public async getUserInfo(): Promise<ForgeUser> {
    const { accessToken } = await this.refreshTokenIfNeeded(this.user);

    return this.forge.getUserInfo(accessToken);
  }

  public async getRepos(search?: string): Promise<Repo[]> {
    const { accessToken } = await this.refreshTokenIfNeeded(this.user);

    return this.forge.getRepos(accessToken, search);
  }
}

export function getForgeFromDB(forge: ForgeModel): Forge {
  switch (forge.type) {
    case 'github':
      return new Github(forge);
    case 'gitlab':
      return new Gitlab(forge);
    default:
      throw new Error(`Unknown forge type: ${forge.type}`);
  }
}

// TODO: find better name
export function getForgeApiFromDB(user: UserWithTokens, forge: ForgeModel): ForgeApi {
  return new ForgeApi(user, getForgeFromDB(forge));
}
