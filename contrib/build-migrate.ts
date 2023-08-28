import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

const modules = ['drizzle-orm', 'better-sqlite3', 'bindings', 'prebuild-install', 'file-uri-to-path', 'dotenv'];

(async () => {
  await build({
    entryPoints: ['./contrib/migrate.ts'],
    bundle: true,
    platform: 'node',
    // watch: true,
    outdir: './contrib/dist',
    packages: 'external',
    external: ['drizzle-orm'],
    plugins: [
      ...modules.map((m) =>
        copy({
          resolveFrom: 'out',
          assets: {
            from: [`node_modules/${m}/**/*`],
            to: [`node_modules/${m}`],
          },
          watch: true,
        }),
      ),
      copy({
        resolveFrom: 'out',
        assets: {
          from: ['package.json'],
          to: ['package.json'],
        },
        watch: true,
      }),
    ],
  });
})();
