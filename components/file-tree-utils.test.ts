import { expect, describe, it } from 'vitest';
import { Directory, setDirectoryRecursive } from './file-tree';

describe('file-tree', () => {
  const fileTree: Directory = {
    name: '/',
    path: '/',
    type: 'directory',
  };

  const dir: Directory = {
    name: 'root',
    path: '/',
    type: 'directory',
    children: [
      {
        type: 'file',
        name: 'file1.txt',
        path: '/file1.txt',
      },
      {
        type: 'directory',
        name: 'folder1',
        path: '/folder1',
      },
    ],
  };

  const subDir: Directory = {
    type: 'directory',
    name: 'folder1',
    path: '/folder1',
    children: [
      {
        type: 'file',
        name: 'file1.txt',
        path: '/folder1/subfile1.txt',
      },
      {
        type: 'directory',
        name: 'folder2',
        path: '/folder1/folder2',
      },
    ],
  };

  const subSubSubDir: Directory = {
    type: 'directory',
    name: 'folder3',
    path: '/folder1/folder2/folder3',
    children: [
      {
        type: 'file',
        name: 'file4.txt',
        path: '/folder1/folder2/folder3/file4.txt',
      },
    ],
  };

  it('should replace root folder', () => {
    const result = setDirectoryRecursive(fileTree, dir);

    expect(result).toMatchSnapshot();
  });

  it('should replace a sub-folder', () => {
    const result = setDirectoryRecursive(dir, subDir);

    expect(result).toMatchSnapshot();
  });

  it('should add a sub-sub-folder while not having the sub-folder yet', () => {
    const result = setDirectoryRecursive(dir, subSubSubDir);

    expect(result).toMatchSnapshot();
  });
});
