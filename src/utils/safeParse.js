import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";

export const safeParse = (html) => {
  if (!html || typeof html !== "string") return null;
  return parse(DOMPurify.sanitize(html));
};
