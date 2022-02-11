/**
 * Parse a possibly tagged string.
 * Example: "This is a comment that has tags @a @b:123"
 * returns: { comment: "This is a comment that has tags", tags: { a: true, b: '123' }}
 */
const parseComment = (
  source: string | undefined
): {
  comment: string | undefined;
  tags: { [index: string]: string | boolean };
} => {
  if (!source) {
    return { comment: undefined, tags: {} };
  }

  const matches = source.match(/(@(\S*))/g) ?? [];
  const tags = matches.reduce((acc, elem) => {
    const [name, value = true] = elem.substr(1).split(':');
    acc[name] = value;
    return acc;
  }, {} as { [index: string]: string | boolean });
  const comment = matches
    .reduce((acc, match) => acc.replace(match, ''), source)
    .trim();

  return {
    comment,
    tags,
  };
};

export default parseComment;
