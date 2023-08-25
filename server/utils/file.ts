import * as fs from 'fs/promises';
import * as path from 'path';

export async function dirExists(path: string) {
  try {
    const stat = await fs.stat(path);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function createDataFolder(p?: string[]) {
  const config = useRuntimeConfig();
  const dataFolder = path.join(config.data_path, ...(p || []));
  if (!(await dirExists(dataFolder))) {
    await fs.mkdir(dataFolder, { recursive: true });
  }
}
