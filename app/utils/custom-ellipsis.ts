const MAX_CHARACTERS = 10;

export const customEllipsis = (text: string, maxChars?: number) => {
  const customMaxChars = maxChars ?? MAX_CHARACTERS;
  const isBiggerThanMaxChars = text.length > customMaxChars;

  if (!isBiggerThanMaxChars) return text;
  return `${text.substring(0, customMaxChars).trim()}...`;
};
