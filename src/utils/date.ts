// Dates render as YYYY.MM.DD across the site (writing index, post meta).
export const formatDate = (date: Date): string => {
  return date.toISOString().slice(0, 10).replace(/-/g, ".");
};
