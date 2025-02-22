import type { FC } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { getBlogList } from "@utils/blog";


export const metadata: Metadata = {
  title: 'Blogs',
};

const NEWEST_PAGE_SIZE = 10;

const Blogs: FC = async () => {
  const newest = (await getBlogList()).items.slice(0, NEWEST_PAGE_SIZE);
  
  return (
    <>
      <h2 className="text-2xl font-bold py-6 px-4">Newest Articles</h2>
      <div className="w-full text-sm pb-4">
        <ol className="overflow-x-hidden overflow-y-auto scroll-style-none">
          {newest.map((blog, i) => (
            <li key={i} className="even:bg-gray-400/10">
              <div className="block px-4 py-3 opacity-90 space-y-1 hover:opacity-100 focus-within:opacity-100 hover:bg-gray-400/5 focus:bg-gray-400/5">
                <Link href={`/blogs/p/${blog.id}`} className="!space-y-0.5">
                  <p className="font-semibold capitalize line-clamp-1 text-ellipsis">{blog.title}</p>
                  <div className="pb-1">
                    {blog.tags.map((tag, i) => (
                      <span key={i} className="text-xs text-gray-500">
                        [{tag}]
                      </span>
                    ))}
                  </div>
                  <p className="font-thin text-[96%] !leading-5 line-clamp-2 portrait:line-clamp-3 text-ellipsis">{blog.preview}...</p>
                </Link>
                <div className="text-xs">
                  <p className="text-gray-600">
                    by {
                      <Link href={`/blogs/author/${encodeURIComponent(blog.author)}`} className="hover:underline focus:underline hover:text-gray-700 focus:text-gray-700">
                        {blog.author}
                      </Link>
                    } | {blog.date}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
};


export default Blogs;
