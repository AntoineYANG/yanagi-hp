import { type NextRequest } from "next/server";


export interface ISearchEntry {
  id: string;
  title: string;
  preview: string;
  score: number;
}

export interface ISearchResult {
  query: string;
  keywords: string[];
  match: ISearchEntry[];
  count: number;
  pageSize: number;
  page: number;
}

const stopWords = ["the", "and", "of", "in", "a", "to", "for", "on", "with", "as"];

const preprocess = (raw: string) => {
  return raw.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 0 && !stopWords.includes(word) && !/^[^\w\d]+$/.test(word) && !/^[a-z]{1,2}$/.test(word))
    .join(' ');
};

const PREVIEW_LEN = 200;
const TITLE_WEIGHT = 256;

const PAGE_SIZE = 20;

export const GET = async (request: NextRequest): Promise<Response> => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const page = Number(searchParams.get('page')) || 0;

  if (!query) {
    return new Response(
      "No valid query found",
      { status: 500 },
    );
  }

  const _kw = query.toLowerCase().split(/\W+/).map(w => preprocess(w).trim()).filter(Boolean);
  const kw = _kw.reduce<string[]>((list, word) => {
    if (!list.includes(word)) {
      list.push(word);
    }
    return list;
  }, []);

  const { default: data } = await import("@/public/build/all-pages-text.json");

  const result: ISearchResult = {
    query,
    keywords: kw,
    match: [],
    count: 0,
    pageSize: PAGE_SIZE,
    page,
  };

  for (const doc of data) {
    let score = 0;

    for (const word of kw) {
      if (doc.title.indexOf(word) !== -1) {
        score += Math.sqrt(word.length);
      }
    }

    score *= TITLE_WEIGHT;
    let preview = '';
    const paras: Array<Pick<ISearchEntry, 'preview' | 'score'>> = [];

    for (const para of doc.raw.split('\n')) {
      const text = preprocess(para);
      let localScore = 0;
      for (const word of kw) {
        const index = text.indexOf(word);
        if (index !== -1) {
          localScore += Math.sqrt(word.length);
        }
      }
      if (localScore > 0) {
        score += localScore;
        paras.push({
          preview: para.slice(0, PREVIEW_LEN),
          score: localScore,
        });
      }
    }
    if (paras.length > 0) {
      paras.sort((a, b) => b.score - a.score);
      preview = paras[0].preview;
    } else {
      preview = doc.raw.slice(0, PREVIEW_LEN);
    }

    if (score > 0) {
      score *= Math.log10(doc.raw.length + 20) / 10;
      
      result.match.push({
        id: doc.path,
        title: doc.title,
        preview,
        score,
      });
    }
  }

  result.count = result.match.length;
  result.match = result.match.toSorted((a, b) => b.score - a.score).slice(PAGE_SIZE * page, PAGE_SIZE * (page + 1));

  return new Response(
    JSON.stringify(result),
    { status: 200 },
  );
};
