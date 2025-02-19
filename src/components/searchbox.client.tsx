"use client";

import { type KeyboardEventHandler, useCallback, useEffect, useState, type FC, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

import type { ISearchResult } from "@/app/api/search/route";
import { font } from "@/src/theme";
import { throttle } from "@utils/functions";
import Button from "./button.client";

import "./nav-bar/nav-bar.css";


interface IAutocomplete {
  query: string;
  result: ISearchResult;
}

const Searchbox: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchboxOpen, setSearchboxOpen] = useState(false);
  const [aniBusy, setAniBusy] = useState(false);
  const aniBusyTimerRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    return () => {
      const { current: timer } = aniBusyTimerRef;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, []);
  const onClickOpenSearchboxButton = useCallback(() => {
    setSearchboxOpen(true);
    setAniBusy(true);
    aniBusyTimerRef.current = setTimeout(() => {
      setAniBusy(false);
    }, 200);
  }, []);
  const onClickCloseSearchboxButton = useCallback(() => {
    setSearchboxOpen(false);
    setAniBusy(true);
    aniBusyTimerRef.current = setTimeout(() => {
      setAniBusy(false);
    }, 200);
  }, []);

  const [sbValue, setSbValue] = useState('');
  useEffect(() => {
    setSbValue('');
  }, [searchboxOpen]);

  const query = sbValue.trim().split(/\W+/).join(" ");
  const queryValid = searchboxOpen && query.length >= 2;

  const search = useCallback(() => {
    if (!queryValid) {
      return;
    }
    router.push(`/search?query=${query}`);
  }, [query, router, queryValid]);

  const handleSearchboxKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(ev => {
    if (ev.key === 'Esc') {
      ev.preventDefault();
      setSearchboxOpen(false);
    } else if (ev.key === 'Enter') {
      ev.preventDefault();
      search();
    }
  }, [search]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (searchboxOpen) {
      inputRef.current?.focus();
    }
  }, [searchboxOpen]);

  const [autocomplete, setAutocomplete] = useState<IAutocomplete | null | "loading">(null);
  const [acX, setAcX] = useState(0);
  const [acY, setAcY] = useState(0);
  const [acW, setAcW] = useState(0);
  const portalContainerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    portalContainerRef.current = document.body;
    setMounted(true);
    return () => {
      portalContainerRef.current = null;
      setMounted(false);
    };
  }, []);

  const ac = useMemo(() => throttle(async (q: string) => {
    const res = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
    if (res.status === 200) {
      const data: ISearchResult = await res.json();
      setAutocomplete({
        query: q,
        result: data,
      });
    } else {
      setAutocomplete(null);
    }
  }, { interval: 1_000, trailing: true }), []);

  useEffect(() => {
    const { current: input } = inputRef;
    if (queryValid && input) {
      const { left, bottom, width } = input.getBoundingClientRect();
      setAcX(left);
      setAcY(bottom);
      setAcW(width);
      setAutocomplete('loading');
      ac(query);
    } else {
      setAutocomplete(null);
    }
  }, [ac, query, queryValid]);

  return (
    <div className="px-1 flex items-center justify-center">
      <div
        className={`${searchboxOpen ? 'w-96 max-w-[60vw] opacity-100' : 'w-0 opacity-0 pointer-events-none'} transition-all duration-300 flex relative`}
      >
        <input
          aria-label="Searchbox"
          className={`flex-1 border border-gray-500 rounded-sm px-2 py-1 min-w-0 text-base ${font.sometypeMono.className}`}
          onKeyDown={handleSearchboxKeyDown}
          value={sbValue}
          placeholder="Search in the site..."
          onChange={ev => setSbValue(ev.target.value)}
          onBlur={onClickCloseSearchboxButton}
          ref={inputRef}
        />
        <div className="z-10 absolute right-1 top-1/2 -translate-y-1/2 h-full flex items-center justify-center">
          <Button
            className="flex-none inline-block cursor-pointer mr-0 relative z-0 group rounded-full overflow-hidden backdrop-blur-[1px] backdrop-brightness-125"
            aria-label="next"
            onTrigger={search}
          >
            <div
              className="absolute -z-10 inset-0 bg-background opacity-20 group-hover:opacity-50 pointer-events-none"
            />
            <MagnifyingGlassIcon
              width="1.2em" height="1.2em"
              stroke="currentColor"
              role="presentation"
              aria-hidden="true"
              className="m-1 pointer-events-none select-none opacity-75 group-hover:opacity-100 group-focus:opacity-100"
            />
          </Button>
        </div>
        {Boolean(autocomplete) && mounted && Boolean(portalContainerRef.current) && acW > 0 && createPortal((
          <div
            className="z-40 fixed min-h-32 bg-background text-foreground/80 backdrop-blur-3xl shadow-lg rounded border-dashed border border-foreground/60 flex flex-col items-center justify-center"
            style={{
              left: `${acX}px`,
              top: `${acY}px`,
              width: `${acW}px`,
            }}
          >
            {autocomplete === "loading" && (
              <div className="flex-none flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-blue-600 saturate-[52%]"></div>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-blue-600 saturate-[56%]"></div>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-blue-600 saturate-[60%]"></div>
              </div>
            )}
            {autocomplete && typeof autocomplete === "object" && (
              <div className="w-full h-full flex-1 text-sm pb-4">
                <ol className="max-h-60 overflow-x-hidden overflow-y-auto scroll-style-none">
                  {autocomplete.result.match.map((res, i) => (
                    <li key={i} className={res.id === pathname ? 'hidden' : ''}>
                      <Link href={res.id} className="block px-4 py-3 opacity-90 hover:opacity-100 focus-within:opacity-100 hover:bg-gray-400/10 focus:bg-gray-400/10">
                        <div className="pointer-events-none !space-y-0.5">
                          <p className="font-semibold capitalize">{res.title}</p>
                          <p className="font-thin text-[96%] !leading-5 line-clamp-3">{res.preview}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        ), portalContainerRef.current!)}
      </div>
      <Button
        className={`flex-none ${searchboxOpen ? 'inline-block' : 'hidden'} cursor-pointer hover:opacity-75 focus:opacity-75`}
        aria-label="Close searchbox"
        disabled={aniBusy}
        onTrigger={onClickCloseSearchboxButton}
      >
        <XMarkIcon
          width="1.2em" height="1.2em"
          stroke="currentColor"
          role="presentation"
          aria-hidden="true"
          className="m-2 pointer-events-none select-none"
        />
      </Button>
      <Button
        className={`flex-none ${searchboxOpen ? 'hidden' : 'inline-block'} cursor-pointer hover:opacity-75 focus:opacity-75`}
        aria-label="Search in the site"
        disabled={aniBusy}
        onTrigger={onClickOpenSearchboxButton}
      >
        <MagnifyingGlassIcon
          width="1.2em" height="1.2em"
          stroke="currentColor"
          role="presentation"
          aria-hidden="true"
          className="m-2 pointer-events-none select-none"
        />
      </Button>
    </div>
  );
};


export default Searchbox;
