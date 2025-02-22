"use client";

import Link from "next/link";
import type { FC } from "react";
import type { ISearchResult } from "@api/search/route";
import Pagination from "@/src/components/pagination.client";


const ResultList: FC<{ page: number; query: string; data: ISearchResult }> = ({ page, query, data }) => {
  const total = data.count;
  return (
    <div className="w-full min-h-full h-[max-content] space-y-8">
      <div className="text-end text-gray-500">
        <p><span className="text-gray-800">{total}</span> results found</p>
      </div>
      <div className="w-full text-sm pb-4">
        <ol className="overflow-x-hidden overflow-y-auto scroll-style-none divide-y">
          {data.match.map((res, i) => (
            <li key={i}>
              <Link href={res.id} className="block px-2 landscape:px-4 py-3 opacity-90 hover:opacity-100 focus-within:opacity-100 hover:bg-gray-400/10 focus:bg-gray-400/10">
                <div className="pointer-events-none !space-y-0.5">
                  <p className="font-semibold capitalize">{res.title}</p>
                  <p className="font-thin text-[96%] !leading-5 line-clamp-4">{res.preview}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex-none w-full text-lg text-center">
        <Pagination
          total={Math.floor(total / data.pageSize)}
          current={page}
          onChange={(router, val) => router.push(`/search?query=${encodeURIComponent(query)}&page=${encodeURIComponent(val)}`)}
        />
      </div>
    </div>
  );
};


export default ResultList;
