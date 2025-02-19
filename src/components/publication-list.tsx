import { memo } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import type { PublicationInfo } from "@utils/publication";
import { mdxComponents as MDX } from "@cp/mdx";

import profileData from "@constant/profile.json";
import Link from "next/link";


interface IPublicationListProps {
  publications: PublicationInfo<'conference' | 'journal'>[];
  /** @default false */
  ignoreOnStage?: boolean;
  /** @default Infinity */
  limit?: number;
  /** @default true */
  rich?: boolean;
}

const DATE_VAL_CENTURY_BEFORE = Date.now() - 1_000 * 60 * 60 * 24 * 365 * 100;

const authorSelfPtn = new RegExp(`${profileData.aliases.concat(profileData.fullName).map(alias => alias.replaceAll(/\./g, '\\.')).join("|")}`);

const AuthorEmphasized = memo<{ authors: string }>(function AuthorEmphasized ({ authors }) {
  const match = authorSelfPtn.exec(authors);

  if (!match) {
    return <>{authors}</>;
  }

  const left = authors.slice(0, match.index);
  const value = match[0];
  const right = authors.slice(match.index + value.length);
  
  return (
    <>
      {left}
      <em className="font-bold">
        {value}
      </em>
      {right}
    </>
  );
});

const PublicationList = memo<IPublicationListProps>(function PublicationList ({ publications, ignoreOnStage = false, limit = Infinity, rich = true }) {
  const total = publications.filter(p => {
    if (ignoreOnStage && p.status) {
      return false;
    }
    return true;
  });
  const shouldSortAndLimit = total.length > limit;
  const totalWithDate = total.map(p => ({
    ...p,
    __date: new Date(p.date || `Jan 1 ${p.year}`).valueOf(),
  })).filter(p => !shouldSortAndLimit || Number.isFinite(p.__date) && p.__date >= DATE_VAL_CENTURY_BEFORE);
  const list = shouldSortAndLimit ? totalWithDate.toSorted((a, b) => b.__date - a.__date).slice(0, limit) : totalWithDate;
  
  return (
    <MDX.ul>
      {list.map((p, i) => {
        const timeStr = p.date || `${p.year}`;
        return (
          <MDX.li key={i}>
            <MDX.p>
              <AuthorEmphasized authors={p.authors} />
              {", "}<em className={`font-semibold ${rich ? 'underline' : ''} not-italic`}>{p.title}</em>
              {", "}{p.status ? `${p.status} in ` : ''}
              <i>{'journal' in p ? (p as PublicationInfo<'journal'>).journal : (p as PublicationInfo<'conference'>).conference}</i>
              {timeStr ? `, ${timeStr}` : ''}{'.'}
              {
                p.note ? (
                  <span className="inline-block rounded-full bg-gray-100 text-gray-900 mx-1.5 px-2 py-0.5 -translate-y-[0.1rem] text-xs cursor-default">
                    {p.note}
                  </span>
                ) : null
              }
              {
                rich && p.link && p.link.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url}
                    target="_blank"
                    className="hover:underline inline-flex items-center text-sm space-x-0.5 group text-blue-800 ml-1.5"
                  >
                    <span className="flex-none">
                      {link.text}
                    </span>
                    <ArrowTopRightOnSquareIcon aria-hidden="true" role="presentation" className="w-2 h-2 flex-none stroke-blue-700" />
                  </Link>
                ))
              }
            </MDX.p>
          </MDX.li>
        );
      })}
    </MDX.ul>
  );
});


export default PublicationList;
