import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Explicitly set root to this package's directory.
    // Prevents the spurious "multiple lockfiles detected" warning when a
    // parent-directory package-lock.json is found by Turbopack's workspace
    // scanner. See: nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
    root: __dirname,
  },
};

export default nextConfig;
