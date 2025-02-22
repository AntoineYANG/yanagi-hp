import { readdir, readFile, stat } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { type FC } from "react"
import matter from "gray-matter";
import Balancer from "react-wrap-balancer";

import MDX from "@cp/mdx";
import { postDir } from "@utils/blog";
import { font } from "@/src/theme";
import Link from "next/link";


export async function generateStaticParams() {
  const posts = await readdir(postDir);
  
  return posts.map((post) => ({
    id: post.split(/(\/|\\)/).at(-1)!.replace(/\.md$/g, ''),
  }));
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const raw = await readFile(path.join(postDir, `${id}.md`));
  const { data } = matter(raw);
  
  return {
    title: data.title,
  };
}

const BlogDetail: FC<{ params: Promise<{ id: string }> }> = async ({ params }) => {
  const { id } = await params;
  const fn = path.join(postDir, `${id}.md`);
  const raw = await readFile(fn);
  const { content, data } = matter(raw);
  const { title = "No Title", tags = [], date = (await stat(fn)).mtime, author = 'anonymous' } = data;
  
  return (
    <article>
      <h1 className={`${font.kleeOne.className} text-4xl text-gray-950 xl:text-5xl leading-[1.5em] font-bold text-foreground -mt-4 portrait:-mt-6 mb-10 portrait:mb-6 pb-6 border-b text-center`}>
        <Balancer j={0.6}>{title}</Balancer>
      </h1>
      <div className="text-start space-x-2 mb-2 flex flex-wrap">
        {tags.map((tag: string, i: number) => (
          <Link key={i} href={`/blogs/tag/${encodeURIComponent(tag)}`} className="px-2 py-0.5 mb-2 rounded-full bg-gray-50/50 hover:bg-gray-100/60 focus:bg-gray-100/60">
            <span key={i} className="text-sm leading-4 text-gray-800 whitespace-nowrap">
              {tag}
            </span>
          </Link>
        ))}
      </div>
      <p className="text-gray-400 text-end">
        <Link href={`/blogs/author/${encodeURIComponent(author)}`} className="hover:underline focus:underline hover:text-gray-700 focus:text-gray-700">
          <span>
            {author}
          </span>
        </Link>
        &nbsp;-&nbsp;
        <span>
          {new Date(date).toLocaleDateString()}
        </span>
      </p>
      <MDX>
        {`${content}`}
      </MDX>
    </article>
  );
};


export default BlogDetail;
