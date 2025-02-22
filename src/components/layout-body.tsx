"use client";

import { createContext, type PropsWithChildren, type FC, useState, useMemo, useContext, useLayoutEffect, type Dispatch, type SetStateAction } from "react";


export interface IPageContext {
  title: string | null;
  asideStart: PropsWithChildren["children"];
  asideEnd: PropsWithChildren["children"];
  update: Dispatch<SetStateAction<Omit<IPageContext, "update">>>;
}

const defaultPageCtx: IPageContext = {
  title: null,
  asideStart: null,
  asideEnd: null,
  update() {},
};

export const PageContext = createContext<IPageContext>(defaultPageCtx);

const LayoutBody: FC<PropsWithChildren> = ({ children }) => {
  const [pageState, setPageState] = useState<Omit<IPageContext, "update">>(defaultPageCtx);

  const pageCtx = useMemo<IPageContext>(() => ({ ...pageState, update: setPageState }), [pageState]);

  const { title, asideStart, asideEnd } = pageCtx;
  
  return (
    <PageContext.Provider value={pageCtx}>
      <div className="flex xl:flex-row flex-col min-h-[calc(90vh-12rem)]">
        <aside className="xl:flex-1 xl:pl-16 overflow-hidden">
          <div className="w-full text-center relative">
            {asideStart}
          </div>
        </aside>
        <main className="flex-none px-8 mb-32">
          <article className="mx-auto mt-8 xl:mt-0 landscape:w-[800px] xl:!w-[calc(377.6px+33vw)] xl:pt-8">
            {title && (
              <>
                <h1 className="landscape:sr-only text-foreground font-bold text-4xl">{title}</h1>
                <hr className="landscape:hidden my-6" />
              </>
            )}
            {children}
          </article>
        </main>
        <aside className="xl:flex-1 xl:pr-16 overflow-hidden">
          <div className="w-full text-center relative">
            {asideEnd}
          </div>
        </aside>
      </div>
    </PageContext.Provider>
  );
};

export const useTitle = (title: IPageContext["title"]): void => {
  const { update } = useContext(PageContext);

  useLayoutEffect(() => {
    update(ctx => ({ ...ctx, title }));
    return () => update(ctx => ({ ...ctx, title: null }));
  }, [update, title]);
};

export const PageTitle: FC<{ children: string }> = ({ children: title }) => {
  const [mounted, setMounted] = useState(false);

  useTitle(title);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted ? null : <h1 className="sr-only">{title}</h1>;
};

export const useAsideStart = (element: IPageContext["asideStart"]): void => {
  const { update } = useContext(PageContext);

  useLayoutEffect(() => {
    update(ctx => ({ ...ctx, asideStart: element }));
    return () => update(ctx => ({ ...ctx, asideStart: null }));
  }, [update, element]);
};

export const AsideStart: FC<NonNullable<Required<PropsWithChildren>>> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useAsideStart(children);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);
  
  return mounted ? null : <div className="sr-only">{children}</div>;
};


export default LayoutBody;
