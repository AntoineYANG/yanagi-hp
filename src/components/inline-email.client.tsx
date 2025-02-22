"use client";

import { type MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

import { font } from "@/src/theme";
import { CopyButton } from "./button.client";


interface IInlineEmailProps {
  value: string;
  replacer?: Record<string, string>;
}

let clearer: (() => void) | null = null;

const InlineEmail: FC<IInlineEmailProps> = ({ value, replacer }) => {
  const emailText = useMemo(() => {
    let email = value;
    if (replacer) {
      for (const domain in replacer) {
        if (Object.prototype.hasOwnProperty.call(replacer, domain)) {
          if (email.match(new RegExp(`@${domain}$`, 'i'))) {
            const alt = replacer[domain];
            email = email.replace(/@.*$/, ` at ${alt}`);
            break;
          }
        }
      }
    }
    return email.replace("@", " [at] ");
  }, [value, replacer]);

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

  const textRef = useRef<HTMLParagraphElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<null | [number, number]>(null);
  const [clicked, setClicked] = useState(false);
  const [aboveText, setAboveText] = useState(false);
  const [aboveBox, setAboveBox] = useState(false);
  const shouldToolboxDisplay = pos !== null;
  const position = pos === null ? [0, 0] as NonNullable<typeof pos> : pos;

  const handleClickText = useCallback<MouseEventHandler<HTMLSpanElement>>(e => {
    if (shouldToolboxDisplay || !textRef.current) {
      return;
    }
    e.stopPropagation();
    const { left, right, top } = textRef.current.getBoundingClientRect();
    setPos([left * 0.25 + right * 0.75, top]);
    setClicked(true);
  }, [shouldToolboxDisplay]);
  useEffect(() => {
    if (shouldToolboxDisplay) {
      const cb = (e: MouseEvent | Event) => {
        if (e.type === 'mousedown' && e.target && e.target instanceof HTMLElement) {
          for (let index = 0, el = e.target; index < 5 && el.parentElement; index += 1, el = el.parentElement) {
            if (el === textRef.current || el === boxRef.current) {
              return;
            }
          }
        }
        setPos(null);
        setClicked(false);
        setAboveText(false);
        setAboveBox(false);
      };
      document.body.addEventListener("mousedown", cb);
      document.addEventListener("visibilitychange", cb);
      return () => {
        document.body.removeEventListener("mousedown", cb);
        document.removeEventListener("visibilitychange", cb);
      };
    }
  }, [shouldToolboxDisplay]);

  const handleMouseOverText = useCallback(() => {
    if (shouldToolboxDisplay || !textRef.current) {
      return;
    }
    const { left, right, top } = textRef.current.getBoundingClientRect();
    setPos([left * 0.25 + right * 0.75, top]);
    setAboveText(true);
  }, [shouldToolboxDisplay]);

  const handleMouseOutText = useCallback(() => {
    setAboveText(false);
  }, []);

  const handleMouseOverBox = useCallback(() => {
    setAboveBox(true);
  }, []);

  const handleMouseOutBox = useCallback(() => {
    setAboveBox(false);
  }, []);

  const timerRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (shouldToolboxDisplay && !clicked) {
      if (!aboveBox && !aboveText) {
        timerRef.current = setTimeout(() => {
          setPos(null);
        }, 400);
      }
    }
  }, [shouldToolboxDisplay, clicked, aboveBox, aboveText]);
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  });

  const [left, right] = value.split("@");

  useEffect(() => {
    if (shouldToolboxDisplay) {
      clearer?.();
      clearer = () => setPos(null);
      return () => {
        clearer = null;
      };
    }
  }, [shouldToolboxDisplay]);

  const { l, m, r } = useMemo(() => {
    return (/^(?<l>.*)(?<m>((\[at\])|( at )))(?<r>.*)$/.exec(emailText)?.groups ?? { l: emailText, m: '', r: '' }) as { l: string; m: string; r: string };
  }, [emailText]);

  return (
    <>
      <p
        className="inline select-none"
        onClick={handleClickText}
        ref={textRef}
        onMouseOver={handleMouseOverText}
        onMouseOut={handleMouseOutText}
      >
        <span className="underline">{l}</span>
        {m !== '' ? <span className="opacity-75" >{m}</span> : null}
        {r !== '' ? <span className="opacity-90">{r}</span> : null}
        {m !== '' ? <sup><small>※</small></sup> : null}
      </p>
      {mounted && Boolean(portalContainerRef.current) && createPortal((
        <div
          className={`with-arrow ${shouldToolboxDisplay ? 'flex' : 'hidden'} items-center justify-center space-x-1 fixed z-10 hover:z-50 px-4 py-2 bg-background text-foreground/80 backdrop-blur-3xl shadow-md rounded border-dashed border border-foreground/40 -translate-y-full -translate-x-1/2`}
          style={{
            left: `${[position[0]]}px`,
            top: `${[position[1] - 4]}px`,
          }}
          ref={boxRef}
          onMouseOver={handleMouseOverBox}
          onMouseOut={handleMouseOutBox}
        >
          <div className={`relative ${font.sometypeMono.className} bg-gray-100 rounded-sm px-1 text-sm font-thin whitespace-nowrap`}>
            <blockquote aria-hidden className="relative px-1">
              {left}
              <span className="select-none">{" "}</span>
              {right}
            </blockquote>
            <blockquote aria-hidden className="absolute left-1 top-0 whitespace-pre select-none px-1">
              <span>{" ".repeat(left.length)}</span>
              {"@"}
              <span>{" ".repeat(right.length)}</span>
            </blockquote>
          </div>
          <CopyButton
            className="flex-none inline-flex text-white bg-green-600/50 hover:bg-green-600/60 focus:bg-green-600/60 w-5 h-5 rounded flex-row items-center justify-center"
            text={value}
          />
          <Link
            href={`mailto:${value}`}
            target="_blank"
            aria-label="Edit message"
            className="flex-none text-white bg-blue-600/50 hover:bg-blue-600/60 focus:bg-blue-600/60 w-5 h-5 rounded flex flex-row items-center justify-center"
          >
            <PaperAirplaneIcon aria-label="Edit message" title="Edit message" className="inline-block select-none pointer-events-none w-4 h-4" />
          </Link>
        </div>
      ), portalContainerRef.current!)}
    </>
  );
};


export default InlineEmail;
