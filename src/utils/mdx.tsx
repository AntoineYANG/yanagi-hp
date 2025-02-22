import { isValidElement, type ReactElement } from "react";
import { compileMDX } from "next-mdx-remote/rsc";


const extractTextFromParagraphs = (el: ReactElement, insideP: boolean = false): string => {
  let result = '';

  if (typeof el.type === "function") {
    // @ts-expect-error checked
    return result += extractTextFromParagraphs(el.type(el.props), insideP);
  }

  if (Array.isArray(el)) {
    el.forEach(child => {
      result += extractTextFromParagraphs(child, insideP);
    });
  } else if (isValidElement(el) && typeof el.props === 'object' && el.props && "children" in el.props) {
    const isP = el.type === 'p';
    result += extractTextFromParagraphs(el.props.children as ReactElement, insideP || isP);
  } else if (typeof el === 'string' || typeof el === 'number') {
    if (insideP) {
      result += `${el}`;
    }
  }
  
  return result;
};

export const extractContent = async (raw: string): Promise<string> => {
  const { content } = await compileMDX({ source: raw });
  return extractTextFromParagraphs(content);  
};
