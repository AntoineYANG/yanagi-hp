"use client";

import { type FC } from "react"
import Link from "next/link";

import Pagination from "@cp/pagination.client";
import type { IGetBlogListResult } from "@utils/blog";


interface IBlogSearchByAuthorResultListProps {
  data: IGetBlogListResult;
  page: number;
  author: string;
}

const BlogSearchByAuthorResultList: FC<IBlogSearchByAuthorResultListProps> = ({ data, page, author }) => {
  const total = data.count;

  return (
    <div className="w-full min-h-full h-[max-content] space-y-8">
      <div className="text-end text-gray-500">
        <p><span className="text-gray-800">{total}</span> results found</p>
      </div>
      <ol className="overflow-x-hidden overflow-y-auto scroll-style-none">
        {data.items.map((blog, i) => (
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
                  {blog.date}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="flex-none w-full text-lg text-center">
        <Pagination
          total={Math.ceil(total / data.pageSize)}
          current={page}
          onChange={(router, val) => router.push(`/blogs/author/${encodeURIComponent(author)}?page=${encodeURIComponent(val)}`)}
        />
      </div>
    </div>
  );
};


export default BlogSearchByAuthorResultList;
