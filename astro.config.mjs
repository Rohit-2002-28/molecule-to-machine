import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://rohit-2002-28.github.io',
  base: '/molecule-to-machine',
  trailingSlash: 'always',
  output: 'static',
  server: { host: '127.0.0.1', port: 4321 },
});
