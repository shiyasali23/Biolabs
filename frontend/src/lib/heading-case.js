// Presentation only: preserve acronyms, spelling, and the underlying data keys.
export function headingCase(value) {
  return typeof value === "string"
    ? value.replace(/(^|[\s/-])(\p{Ll})/gu, (_, prefix, letter) => prefix + letter.toUpperCase())
    : value;
}
