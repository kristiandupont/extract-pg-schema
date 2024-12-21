// Parse PostgreSQL array format like '{text}' or '{}' or '[0:0]={text}'
export function parsePostgresArray(arrayStr: string): string[] {
  // Handle empty array
  if (arrayStr === "{}") return [];

  // Remove brackets, equals, and array dimensions, then split on commas
  return arrayStr
    .replace(/^\[.*\]=/, "") // Remove dimension info like [0:0]=
    .replace(/[{}]/g, "") // Remove curly braces
    .split(",")
    .filter(Boolean); // Remove empty strings
}
