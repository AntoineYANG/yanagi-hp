import { readdir, readFile, stat } from "fs/promises";
import matter from "gray-matter";
import path from "path";

import { extractContent } from "./mdx";


export const postDir = path.join(process.cwd(), "src", "blogs");

const PAGE_SIZE = 20;
const PREVIEW_LEN = 200;

export interface IGetBlogListPayload {
  page?: number;
  author?: string;
  tag?: string;
  /** second */
  notEarlierThan?: number;
}

export interface IBlogListItem {
  id: string;
  title: string;
  mtime: number;
  date: string;
  author: string;
  tags: string[];
  preview: string;
}

export interface IGetBlogListResult {
  items: IBlogListItem[];
  page: number;
  count: number;
  pageSize: number;
}

export const getBlogList = async (payload?: IGetBlogListPayload): Promise<IGetBlogListResult> => {
  const { page = 0, author: qAuthor, tag: qTag, notEarlierThan: qNe } = payload ?? {};

  const posts = await readdir(postDir);
  
  const total: IBlogListItem[] = [];

  for (const id of posts) {
    const fn = path.join(postDir, id);
    const st = await stat(fn);
    if (st.isFile()) {
      const { data, content } = matter(await readFile(fn, 'utf-8'));
      const text = await extractContent(content);
      const mtime = st.mtime;
      const { title = "No Title", tags = [], date = new Date(mtime).toLocaleDateString(), author = 'anonymous' } = data;
      if (qAuthor && qAuthor !== author) {
        continue;
      }
      if (qTag && !tags.includes(qTag)) {
        continue;
      }
      if (qNe && mtime.valueOf() < qNe) {
        continue;
      }
      total.push({
        id: id.replace(/\.md$/, ''),
        title,
        date,
        mtime: mtime.valueOf(),
        preview: text.slice(0, PREVIEW_LEN),
        author,
        tags,
      });
    }
  }

  total.sort((a, b) => b.mtime - a.mtime);

  return {
    items: total.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    page,
    count: total.length,
    pageSize: PAGE_SIZE,
  };
};
