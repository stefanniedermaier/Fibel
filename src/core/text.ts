/** Small text helpers. */

/** First letter upper case: "der Hund" → "Der Hund". */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
