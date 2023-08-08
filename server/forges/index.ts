import { Gitlab } from './gitlab';
import { Forge } from '../schemas';
import { Github } from './github';

export function getForgeFromDB(forge: Forge) {
  switch (forge.type) {
    case 'github':
      return new Github(forge);
    case 'gitlab':
      return new Gitlab(forge);
    default:
      throw new Error(`Unknown forge type: ${forge.type}`);
  }
}
