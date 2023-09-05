export type File = {
  path: string;
  name: string;
  type: 'file';
};

export type Directory = {
  path: string;
  name: string;
  type: 'directory';
  children?: (Directory | File)[];
};

export function setDirectoryRecursive(parent: Directory, directory: Directory): Directory {
  if (parent.path === directory.path) {
    return directory;
  }

  let children = parent.children || [];

  if (!children.find((c) => directory.path.startsWith(c.path))) {
    const a = directory.path.replace(new RegExp(`^${parent.path}\/`), '').split('/');
    const name = a[0];
    if (name !== '') {
      children.push({
        path: `${parent.path}/${name}`,
        name,
        type: 'directory',
        children: [],
      });

      console.log('should add', directory.path, name);
    }
  }

  children = children.map((c) => {
    if (c.type === 'file') {
      return c;
    }

    if (parent.path === directory.path) {
      return directory;
    }

    return setDirectoryRecursive(c, directory);
  });

  return { ...parent, children };
}
