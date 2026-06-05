const PREFIX = "PROSPEROFY_SAFE_CLIPBOARD_";
const SEGMENT_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SEGMENT_LENGTH = 4;
const SEGMENT_COUNT = 3;

function randomSegment(): string {
  let out = "";
  for (let i = 0; i < SEGMENT_LENGTH; i += 1) {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const buf = new Uint8Array(1);
      crypto.getRandomValues(buf);
      out += SEGMENT_CHARS[buf[0]! % SEGMENT_CHARS.length];
    } else {
      out += SEGMENT_CHARS[Math.floor(Math.random() * SEGMENT_CHARS.length)];
    }
  }
  return out;
}

/** Harmless placeholder text to help overwrite sensitive clipboard contents. */
export function generateSafeClipboardText(): string {
  const segments = Array.from({ length: SEGMENT_COUNT }, () => randomSegment());
  return `${PREFIX}${segments.join("-")}`;
}

export function isSafeClipboardText(value: string): boolean {
  return value.startsWith(PREFIX);
}
