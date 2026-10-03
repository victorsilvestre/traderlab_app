import nextConfig from 'eslint-config-next/core-web-vitals';
import { globalIgnores } from 'eslint/config';

export default [
  ...nextConfig,
  globalIgnores(['**/.next/**', '**/dist/**', '**/coverage/**', 'apps/api/src/generated/**']),
];
