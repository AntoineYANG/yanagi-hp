import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { type FC } from "react"
import matter from "gray-matter";

import { getBlogList, postDir } from "@utils/blog";
import BlogSearchByAuthorResultList from "./result-list.client";


const posts = await readdir(postDir);
const authors = new Set<string>();
for (const id of posts) {
  const fn = path.join(postDir, id);
  const st = await stat(fn);
  if (st.isFile()) {
    const { data } = matter(await readFile(fn, 'utf-8'));
    const { author = 'anonymous' } = data;
    authors.add(author);
  }
}

export async function generateStaticParams() {
  return [...authors].map(author => ({
    name: author,
  }));
};

export async function generateMetadata({ params }: { params: Promise<{ author: string }> }): Promise<Metadata> {
  const { author } = await params;
  return {
    title: `Blogs by ${author}`,
  };
}

const BlogsOfAuthor: FC<{ params: Promise<{ name: string }>; searchParams: Promise<{ page?: number }> }> = async ({ params, searchParams }) => {
  const name = decodeURIComponent((await params).name);
  const { page: _page = '0' } = await searchParams;
  const page = Number(_page);

  const data = await getBlogList({ author: name, page });
  
  return (
    <>
      <p className="text-2xl font-bold py-6 px-4">Articles by {name}</p>
      <div className="w-full text-sm pb-4">
        <BlogSearchByAuthorResultList
          data={data}
          author={name}
          page={page}
        />
      </div>
    </>
  );
};


export default BlogsOfAuthor;
