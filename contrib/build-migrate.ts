import { build } from 'esbuild';
import { copy } from 'esbuild-plugin-copy';

(async () => {
  const res = await build({
    entryPoints: ['./contrib/migrate.ts'],
    bundle: true,
    platform: 'node',
    // watch: true,
    outdir: './dist',
    plugins: [
      copy({
        resolveFrom: 'cwd',
        assets: {
          from: ['./**/*/build/Release/better_sqlite3.node'],
          to: ['./build/Release/better_sqlite3.node'],
        },
        watch: true,
      }),
    ],
  });
})();
