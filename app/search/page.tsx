import type { FC } from "react";
import type { ISearchResult } from "@api/search/route";
import ResultList from "./result-list.client";


export const dynamic = 'force-dynamic';

export interface ISearchSearchParams {
  query?: string;
  page?: string;
}

const SearchResult: FC<{ searchParams: Promise<ISearchSearchParams> }> = async ({ searchParams }) => {
  const { query, page } = await searchParams;
  const q = typeof query === 'string' ? query : '';
  const i = Number(page) || 0;
  const res = await fetch(`${process.env.DEPLOY_DOMAIN.replace(/\/$/, '')}/api/search?query=${encodeURIComponent(q)}&page=${encodeURIComponent(i)}`);

  if (res.status === 200) {
    const data: ISearchResult = await res.json();
    return (
      <ResultList
        query={q}
        page={i}
        data={data}
      />
    );
  } else {
    return (
      <p>
        No results found.
      </p>
    );
  }
};


export default SearchResult;
