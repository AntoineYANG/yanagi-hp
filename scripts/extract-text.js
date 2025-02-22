/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const htmlparser2 = require('htmlparser2');
const next = require('next');
const express = require('express');
const http = require('http');
const { node2List } = require('./generate-feeds');

const PORT = 9090;

const baseDir = path.resolve(path.dirname(__filename), '..');
const baseUrl = `http://localhost:${PORT}`;
const publicDir = path.resolve(baseDir, 'public');
const outputDir = path.resolve(publicDir, 'build');
const jsonFileName = path.resolve(outputDir, 'all-routes.json');

const tree = JSON.parse(fs.readFileSync(jsonFileName, "utf-8"));
const pages = node2List(tree);

const outputFilePath = path.join(outputDir, 'all-pages-text.json');

const semanticTags = {
  block: ["div", "article", "main", "section", "p", "pre", "h2", "h3", "h4", "h5", "h6", "blockquote", "dt", "ul", "ol"],
  inline: ["code", "span", "em", "i", "b", "u", "small", "dd", "dl", "li"],
};

const allSemanticTags = semanticTags.block.concat(semanticTags.inline);

function html2text(node, ctx = { insideMain: false }) {
  let res = '';

  for (const child of node.children) {
    if (child.type === "tag") {
      if (allSemanticTags.includes(child.tagName)) {
        if (child.tagName === "main") {
          ctx.insideMain = true;
        }
        res += `${html2text(child, ctx)}`;
        if (semanticTags.block.includes(child.tagName)) {
          res += '\n';
        } else {
          res += ' ';
        }
      }
    } else if (child.type === "text") {
      res += child.data;
    }
  }

  return ctx.insideMain ? res.replaceAll(/\n{2,}/g, '\n\n').replaceAll(/(\n\s*)|(\s*\n)/g, '\n').replace(/^\n/, '') : '';
}

const stopWords = ["the", "and", "of", "in", "a", "to", "for", "on", "with", "as"];

function preprocessText(text) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 0 && !stopWords.includes(word) && isNaN(word) && !/^[^\w\d]+$/.test(word) && !/^[a-z]{1,2}$/.test(word))
    .join(' ');
}

async function extractAllPagesText() {
  const list = [];

  for (const page of pages) {
    if (page.hidden || !page.valid) {
      continue;
    }
    const pageUrl = `${baseUrl}${page.id}`;
    try {
      const res = await fetch(pageUrl);
      const html = await res.text();
      const doc = htmlparser2.parseDocument(html);

      const h = doc.children.find(c => c.tagName === "html");
      const head = h.children.find(c => c.tagName === "head");
      const body = h.children.find(c => c.tagName === "body");

      let title = '';
      const meta = {};
      for (const c of head.children) {
        if (c.tagName === "title") {
          title = c.children.map(e => e.type === "text" ? e.data : '').filter(Boolean).join(' ');
        } else if (c.tagName === "meta" && c.attribs.name && c.attribs.content) {
          meta[c.attribs.name] = c.attribs.content;
        }
      }

      const raw = html2text(body);
      
      list.push({
        path: page.id,
        meta,
        title,
        raw,
        content: raw.split('\n').map(s => preprocessText(s)).join('\n'),
      });
    } catch (error) {
      console.error(`Error processing ${pageUrl}:`, error);
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(list, null, 2), 'utf-8');
  console.log(`All pages have been converted to text and saved to ${outputFilePath}`);
}

async function startNextServer() {
  const app = next({ port: PORT });

  const handle = app.getRequestHandler();

  await app.prepare();

  const server = express();

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const httpServer = http.createServer(server);

  let close;
  
  await new Promise((res, rej) => {
    httpServer.listen(PORT, async (err) => {
      if (err) {
        return rej(err);
      }
      console.log(`Next.js server is running on http://localhost:${PORT}`);
  
      close = () => httpServer.close(() => {
        console.log('Server is closed.');
      });

      res();
    });
  });

  return close;
}

async function main() {
  const closeNextServer = await startNextServer();
  let rc = 0;
  try {
    await extractAllPagesText();
  } catch {
    rc = 1;
  } finally {
    closeNextServer();
  }
  return rc;
}


if (require.main === module) {
  main().then(process.exit);
}
