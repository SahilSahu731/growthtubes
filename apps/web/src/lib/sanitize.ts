import DOMPurify from 'dompurify';
export const sanitize = (html: string | undefined | null): string => {
  if (!html) return '';

  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html);
  }

  return DOMPurify.sanitize(html);
};
