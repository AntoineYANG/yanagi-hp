import { spawn } from "child_process";
import { readFileSync } from "fs";

import type { NextConfig } from "next";
import NextMDX from "@next/mdx";

import { throttle } from "./src/utils/functions";


const withMDX = NextMDX({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scholar.google.com',
        pathname: '/favicon.ico',
      },
    ],
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  webpack(config, { dev, isServer }) {
    const cmdUpdateFeeds = 'node scripts/generate-feeds.js';
    
    if (isServer) {
      const executeCLICommand = throttle((stage: 'HMR' | 'Build') => {
        const child = spawn(cmdUpdateFeeds, { shell: true });
  
        child.stdout.on('data', (data) => {
          process.stdout.write(`[CLI Output] ${data}`);
        });
  
        child.stderr.on('data', (data) => {
          process.stderr.write(`[CLI Error] ${data}`);
        });
  
        child.on('exit', (code) => {
          console.log(`[${stage}] CLI command exited with code: ${code}`);
        });
      }, { interval: 3_000, trailing: true });
  
      if (dev) {
        // HMR hook
        config.plugins.push({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apply: (compiler: any) => {
            compiler.hooks.beforeCompile.tapAsync('CLICommandPlugin', (_: unknown, cb: () => void) => {
              executeCLICommand('HMR');
              cb();
            });
          },
        });
        config.watchOptions = {
          ...config.watchOptions,
          ignored: /public\/build\/.*/,
        };
      } else {
        config.plugins.push({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          apply: (compiler: any) => {
            compiler.hooks.beforeCompile.tapAsync('CLICommandPlugin', (_: unknown, cb: () => void) => {
              executeCLICommand('Build');
              cb();
            });
          },
        });
      }
    }

    return config;
  },
};

if (process.env.VERCEL_DEV === 'true') {
  try {
    const vercelProj = JSON.parse(readFileSync("./.vercel/project.json", "utf-8"));
    process.env.NEXT_PUBLIC_VERCEL_TOOLBAR_SERVER = process.env.DEPLOY_DOMAIN;
    process.env.NEXT_PUBLIC_VERCEL_TOOLBAR_OWNER_ID = vercelProj.orgId;
    process.env.NEXT_PUBLIC_VERCEL_TOOLBAR_PROJECT_ID = vercelProj.projectId;
  } catch {}
}


export default withMDX((nextConfig));
