import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { type FC } from "react"
import matter from "gray-matter";

import { getBlogList, postDir } from "@utils/blog";
import BlogSearchByTagResultList from "./result-list.client";


const posts = await readdir(postDir);
const tags = new Set<string>();
for (const id of posts) {
  const fn = path.join(postDir, id);
  const st = await stat(fn);
  if (st.isFile()) {
    const { data } = matter(await readFile(fn, 'utf-8'));
    const { tags: t = [] } = data;
    for (const tag of t) {
      tags.add(tag);
    }
  }
}

export async function generateStaticParams() {
  return [...tags].map(tag => ({
    tag,
  }));
};

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `Blogs of ${tag}`,
  };
}

const BlogsOfAuthor: FC<{ params: Promise<{ tag: string }>; searchParams: Promise<{ page?: number }> }> = async ({ params, searchParams }) => {
  const tag = decodeURIComponent((await params).tag);
  const { page: _page = '0' } = await searchParams;
  const page = Number(_page);

  const data = await getBlogList({ tag, page });
  
  return (
    <>
      <p className="text-2xl font-bold py-6 px-4 capitalize">{tag}</p>
      <div className="w-full text-sm pb-4">
        <BlogSearchByTagResultList
          data={data}
          tag={tag}
          page={page}
        />
      </div>
    </>
  );
};


export default BlogsOfAuthor;
