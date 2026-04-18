import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  outDir: 'dist',
  treeshake: true,
  minify: false,
  // PrismaClient e @clerk/backend permanecem como dependências externas — não embutimos.
  external: ['@prisma/client', '@clerk/backend', 'express'],
});
