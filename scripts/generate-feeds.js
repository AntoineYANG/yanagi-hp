/* eslint-disable @typescript-eslint/no-require-imports */
const { writeFileSync, existsSync, mkdirSync, readdirSync, statSync, readFileSync } = require("fs");
const path = require('path');

const baseDir = path.resolve(path.dirname(__filename), '..');
const appDir = path.resolve(baseDir, 'app');

const publicDir = path.resolve(baseDir, 'public');
const rssFileName = path.resolve(publicDir, 'rss.xml');
const sitemapFileName = path.resolve(publicDir, 'sitemap.xml');
const robotsTxtFileName = path.resolve(publicDir, 'robots.txt');

const outputDir = path.resolve(publicDir, 'build');
const jsonFileName = path.resolve(outputDir, 'all-routes.json');

const siteData = require("../src/constant/site.json");

/** @type {Array<import('../src/utils/site').RouteNode} */
const containers = [];

/**
 * @param {string} dir 
 * @param {(item: import('../src/utils/site').RouteNode) => void} cb 
 */
function recurse(dir, cb) {
  const seg = dir.split(path.sep);
  /** @type {import('../src/utils/site').RouteNode} */
  const data = {
    valid: false,
    id: `/${path.relative(appDir, dir).replaceAll(/\\/g, '/')}`,
    name: seg[seg.length - 1],
    mtime: 0,
    changeFreq: "weekly",
    mode: "common",
    container: "/",
  };
  data.name = data.name.slice(0, 1).toUpperCase() + data.name.slice(1);
  for (const container of containers) {
    if (data.id.startsWith(container.id + "/")) {
      data.mode = container.mode;
      data.container = container.id + "/";
      break;
    }
  }
  const ls = readdirSync(dir);
  for (const name of ls) {
    if (["api", "search", "author", "tag"].includes(name)) {
      continue;
    }
    const fn = path.resolve(dir, name);
    const stat = statSync(fn);
    let inserted = false;
    if (stat.isDirectory()) {
      recurse(fn, item => {
        data.children ??= [];
        if (!data.children.find(c => c.id === item.id)) {
          data.children.push(item);
        }
      });
    } else {
      if (name.match(/^page\.(tsx|jsx?|mdx?)$/)) {
        if (data.mode === "blogs" && seg.at(-1) === "[id]") {
          const target = path.join(baseDir, 'src', ...data.container.split('/').filter(Boolean));
          const ls = readdirSync(target);
          for (const name of ls) {
            const fn = path.resolve(target, name);
            const stat = statSync(fn);
            if (stat.isFile()) {
              if (name.match(/^.+\.md$/)) {
                const postId = name.replace(/\.md$/, '');
                const post = {
                  ...data,
                  valid: true,
                  name: postId,
                  id: data.id.replace(/\[id\]$/, postId),
                  mtime: stat.mtime.valueOf(),
                };
                cb(post);
              }
            }
          }
        } else {
          data.valid = true;
          data.mtime = stat.mtime.valueOf();
          cb(data);
          inserted = true;
        }
      } else if (name === "meta.json") {
        try {
          const { level, hidden, description = "", priority, changeFreq = "weekly", name = "", template = "common" } = JSON.parse(readFileSync(fn, { encoding: 'utf-8' }));
          if (typeof level === 'number') {
            data.level = level;
          }
          if (hidden) {
            data.hidden = true;
          }
          if (description) {
            data.description = description;
          }
          if (name) {
            data.name = name;
          }
          if (template !== "common") {
            data.mode = template;
            data.container = data.id + "/";
            containers.push(data);
          }
          data.changeFreq = changeFreq;
          const isTopLevel = data.id.split('/').length === 2;
          data.priority = priority ?? ((isTopLevel && !hidden) || data.id === '/' ? 1.0 : 0.8);
        } catch (error) {
          console.error(error);
        }
      }
    }
    if (data.id !== "/" && !inserted && data.children?.length) {
      cb(data);
    }
  }
}

/** @param {import('../src/utils/site').RouteNode} root */
function node2List(root) {
  /**
   * @param {import('../src/utils/site').RouteNode} node
   * @param {(el: import('../src/utils/site').RouteNode) => void} cb
   */
  function each(node, cb) {
    cb(node);
    if (node.children?.length) {
      node.children.map(c => each(c, cb));
    }
  }

  /** @type {Array<Omit<import('../src/utils/site').RouteNode, "children">>} */
  const list = [];

  each(root, el => list.push(el));

  return list;
}

/**
 * @param {string} baseUrl
 * @param {ReturnType<typeof node2List>} posts
 */
function generateRSS(baseUrl, posts) {
  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${siteData.seoName} RSS</title>
    <link>${baseUrl}</link>
    <description>${siteData.seoName} Feed</description>
${posts.map(post => `   <item>
      <title>${post.name}</title>
      <link>${baseUrl}${post.id}</link>
      <pubDate>${new Date(post.mtime).toUTCString()}</pubDate>
      <description>${post.description || post.name}</description>
    </item>`).join('\n')}
  </channel>
</rss>`;

  writeFileSync(rssFileName, rssXml, 'utf-8');
}

/**
 * @param {string} baseUrl
 * @param {ReturnType<typeof node2List>} pages
 */
function generateSitemap(baseUrl, pages) {
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${baseUrl}${page.id}</loc>
    <lastmod>${new Date(page.mtime).toISOString()}</lastmod>
    <changefreq>${page.changeFreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  writeFileSync(sitemapFileName, sitemapXml, 'utf-8');
}

/**
 * @param {string} baseUrl
 */
function generateRobotsTxt(baseUrl) {
  const content = `User-agent: *
Disallow: /admin/
Disallow: /search?
Disallow: /api/
Disallow: /tmp/
Disallow: /*?*
Allow: /public/
Crawl-delay: 10

User-agent: Googlebot
Allow: /
Disallow: /no-google/
Crawl-delay: 5

User-agent: Bingbot
Allow: /
Disallow: /no-bing/
Crawl-delay: 10

User-agent: AhrefsBot
Disallow: /
User-agent: MJ12bot
Disallow: /
User-agent: SemrushBot
Disallow: /

Sitemap: ${baseUrl}/sitemap.xml
`;

  writeFileSync(robotsTxtFileName, content, 'utf-8');
}

function main() {
  /** @type {import('../src/utils/site').RouteNode} */
  let routeTree = {};

  recurse(appDir, item => {
    routeTree = item;
  });

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }
  writeFileSync(jsonFileName, JSON.stringify(routeTree, undefined, 2), { encoding: 'utf-8' });

  const posts = node2List(routeTree);
  const baseUrl = process.env.DEPLOY_DOMAIN.replace(/\/$/, '');

  generateRSS(baseUrl, posts);
  generateSitemap(baseUrl, posts);
  generateRobotsTxt(baseUrl);
}


if (require.main === module) {
  main();
}


module.exports = {
  node2List,
};
