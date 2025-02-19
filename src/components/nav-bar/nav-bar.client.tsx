"use client";

import { useCallback, useEffect, useRef, useState, type FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Bars3Icon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/outline";

import type { LinkItem } from "@utils/site";
import Button from "@cp/button.client";
import ArticleProgress from "@cp/article-progress.client";
import Searchbox from "@cp/searchbox.client";
import { font, globalTheme } from "@/src/theme";

import "./nav-bar.css";


interface INavBarPrvProps {
  navItems: LinkItem[];
  homeLabel: string;
  reverseTheme?: boolean;
  transparentAtTop?: boolean;
  reverseTransparentTheme?: boolean;
}

const NavBarPrv: FC<INavBarPrvProps> = ({ navItems, homeLabel, reverseTheme = false, transparentAtTop = false, reverseTransparentTheme = false }) => {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  
  useEffect(() => setMenuOpen(false), [pathname]);

  const [isPortrait, setIsPortrait] = useState(false);
  useEffect(() => {
    const orientationQuery = window.matchMedia('(orientation: portrait)');
    setIsPortrait(orientationQuery.matches);
    const cb = () => {
      setIsPortrait(orientationQuery.matches);
    };
    orientationQuery.addEventListener("change", cb);

    return () => orientationQuery.removeEventListener("change", cb);
  }, []);
  useEffect(() => setMenuOpen(false), [isPortrait]);
  const onClickMenuButton = useCallback(() => setMenuOpen(o => !o), []);

  const navBoxRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const checkScrollable = useCallback(() => {
    const container = navBoxRef.current;
    if (container) {
      const listEl = container.querySelector("ul");
      if (!listEl) {
        return;
      }
      const { clientWidth } = container;
      const { scrollWidth: width, scrollLeft } = listEl;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < width - 10);
    }
  }, []);
  useEffect(() => {
    const container = navBoxRef.current;
    if (container) {
      checkScrollable();
      window.addEventListener('resize', checkScrollable);
      return () => {
        window.removeEventListener('resize', checkScrollable);
      };
    }
  }, [checkScrollable, navItems]);
  const scrollLeft = useCallback(() => {
    const container = navBoxRef.current;
    if (container) {
      const { left: L } = container.getBoundingClientRect();
      const items = container.querySelectorAll("li");
      for (const item of items) {
        const { left: l } = item.getBoundingClientRect();
        if (l < L) {
          item.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
          });
          setTimeout(checkScrollable, 300);
          return;
        }
      }
      checkScrollable();
    }
  }, [checkScrollable]);
  const scrollRight = useCallback(() => {
    const container = navBoxRef.current;
    if (container) {
      const { right: R } = container.getBoundingClientRect();
      const items = container.querySelectorAll("li");
      for (const item of items) {
        const { right: r } = item.getBoundingClientRect();
        if (r > R) {
          item.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'start',
          });
          setTimeout(checkScrollable, 300);
          return;
        }
      }
      checkScrollable();
    }
  }, [checkScrollable]);

  const [atTop, setAtTop] = useState(true);
  useEffect(() => {
    const body = document.getElementById('body');
    if (body) {
      const cb = () => {
        const t = body.scrollTop;
        setAtTop(t === 0);
      };
      body.addEventListener('scroll', cb);
      return () => {
        body.removeEventListener('scroll', cb);
      }
    }
  }, []);

  const reverse = reverseTheme !== (transparentAtTop && reverseTransparentTheme && atTop);

  return (
    <div className="fixed top-0 left-0 right-0 z-30">
      {/* Nav bar */}
      <header
        className={`w-full pl-2 flex flex-row items-center justify-stretch text-lg text-foreground
          ${font.sometypeMono.className} whitespace-nowrap relative
          ${transparentAtTop && atTop ? 'bg-transparent' : 'bg-background'} transition-colors duration-300
        `}
        style={reverse ? {
          // @ts-expect-error css variables
          '--background': globalTheme.foreground,
          '--foreground': globalTheme.background,
        } : undefined}
      >
        <div className="flex-none h-full flex items-center justify-center">
          <div
            className="flex-none mr-2 w-[2.2em] landscape:w-0 landscape:select-none landscape:pointer-events-none transition-all ease-linear flex items-center justify-center overflow-hidden"
          >
            <Button
              className="cursor-pointer landscape:hidden"
              aria-label="menu"
              onTrigger={onClickMenuButton}
            >
              <Bars3Icon
                width="1.4em" height="1.4em"
                stroke="currentColor"
                role="presentation"
                aria-hidden="true"
                className="m-2 pointer-events-none select-none"
              />
            </Button>
          </div>
        </div>
        <div className="h-full header-box landscape:ml-4 py-2 landscape:py-4 pr-2 flex flex-row items-center overflow-hidden">
          <div className="grow-0 shrink min-w-8 text-left text-2xl overflow-hidden text-ellipsis">
            <Link href="/">
              <span className="capitalize select-none">
                {homeLabel}
              </span>
            </Link>
          </div>
          <div className="spring min-w-6" aria-hidden="true" />
          <nav className="grow-0 shrink-[4] text-right overflow-hidden relative z-0" ref={navBoxRef}>
            <ul className="m-0 p-0 list-none h-full space-x-1 overflow-x-scroll scroll-style-none portrait:hidden">
              {
                navItems.map((item, i) => {
                  const isCur = item.url === pathname;

                  return (
                    <li
                      key={`${item.label}~${i}`}
                      className="inline-flex h-full text-center items-center justify-center"
                    >
                      <Link
                        href={item.url}
                        className={`flex-none px-3 outline-none hover:opacity-75 focus:opacity-75 ${
                          isCur ? 'bg-[var(--background)] text-[var(--foreground)]' : 'after-line'
                        }`}
                        style={isCur ? {
                          // @ts-expect-error css variables
                          '--background': reverseTheme ? globalTheme.background : globalTheme.foreground,
                          '--foreground': reverseTheme ? globalTheme.foreground : globalTheme.background,
                        } : undefined}
                      >
                        <span className="capitalize select-none">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })
              }
            </ul>
            {
              canScrollLeft && (
                <div className="z-10 absolute left-0 top-1/2 -translate-y-1/2 h-full flex items-center justify-center">
                  <Button
                    className="flex-none inline-block cursor-pointer mr-0 relative z-0 group rounded-full overflow-hidden backdrop-blur-[1px] backdrop-brightness-125"
                    aria-label="next"
                    onTrigger={scrollLeft}
                  >
                    <div
                      className="absolute -z-10 inset-0 bg-background opacity-20 group-hover:opacity-50 pointer-events-none"
                    />
                    <ChevronLeftIcon
                      width="1.2em" height="1.2em"
                      stroke="currentColor"
                      role="presentation"
                      aria-hidden="true"
                      className="m-1 pointer-events-none select-none opacity-75 group-hover:opacity-100 group-focus:opacity-100"
                    />
                  </Button>
                </div>
              )
            }
            {
              canScrollRight && (
                <div className="z-10 absolute right-0 top-1/2 -translate-y-1/2 h-full flex items-center justify-center">
                  <Button
                    className="flex-none inline-block cursor-pointer mr-0 relative z-0 group rounded-full overflow-hidden backdrop-blur-[1px] backdrop-brightness-125"
                    aria-label="next"
                    onTrigger={scrollRight}
                  >
                    <div
                      className="absolute -z-10 inset-0 bg-background opacity-20 group-hover:opacity-50 pointer-events-none"
                    />
                    <ChevronRightIcon
                      width="1.2em" height="1.2em"
                      stroke="currentColor"
                      role="presentation"
                      aria-hidden="true"
                      className="m-1 pointer-events-none select-none opacity-75 group-hover:opacity-100 group-focus:opacity-100"
                    />
                  </Button>
                </div>
              )
            }
          </nav>
          <div className="flex-none">
            <Searchbox />
          </div>
        </div>
      </header>
      <ArticleProgress />
      {/* Sidebar */}
      <div
        className={`fixed z-50 inset-0 bg-black ${menuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'} transition-opacity`}
        aria-hidden
        role="presentation"
        onClick={menuOpen ? onClickMenuButton : undefined}
      />
      <div className={`landscape:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'} transition-transform shadow-md fixed z-50 left-0 top-0 bottom-0 bg-background h-full min-w-[33vw] max-w-[55vw] p-2 flex flex-col items-center justify-stretch text-lg ${font.sometypeMono.className} whitespace-nowrap`}>
        <div className="flex-none w-full flex flex-col">
          <div className="flex-none mr-2 w-[2.2em] flex overflow-hidden">
            <Button
              className="cursor-pointer landscape:hidden"
              aria-label="menu"
              onTrigger={onClickMenuButton}
            >
              <XMarkIcon
                width="1.4em" height="1.4em"
                stroke="currentColor"
                role="presentation"
                aria-hidden="true"
                className="m-2 pointer-events-none select-none"
              />
            </Button>
          </div>
        </div>
        <div className="flex-1 w-full py-2 pl-12 flex overflow-x-hidden overflow-y-auto">
          <nav className="flex-1 text-left overflow-hidden mt-6">
            <ul className="m-0 p-0 list-none w-full space-y-4 overflow-hidden scroll-style-none flex flex-col mr-6 animation-group">
              {
                menuOpen && navItems.map((item, i) => {
                  const isCur = item.url === pathname;

                  return (
                    <li
                      key={`${item.label}~${i}`}
                      className="inline-flex w-full text-left slide-in-left"
                    >
                      <Link
                        href={item.url}
                        className={`flex-none px-3 outline-none hover:opacity-75 focus:opacity-75 ${
                          isCur ? 'bg-[var(--background)] text-[var(--foreground)]' : 'after-line'
                        }`}
                        style={isCur ? {
                          // @ts-expect-error css variables
                          '--background': globalTheme.foreground,
                          '--foreground': globalTheme.background,
                        } : undefined}
                      >
                        <span className="capitalize select-none">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })
              }
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};


export default NavBarPrv;
