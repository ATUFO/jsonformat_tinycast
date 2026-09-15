export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ParseResult = { ok: true; value: JsonValue } | { ok: false; error: string };

export function parseJson(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "Input is empty." };
  try {
    return { ok: true, value: JSON.parse(trimmed) as JsonValue };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function isContainer(value: JsonValue): value is JsonValue[] | { [key: string]: JsonValue } {
  return value !== null && typeof value === "object";
}

export function containerEntries(value: JsonValue): Array<[string, JsonValue]> {
  if (Array.isArray(value)) return value.map((item, index) => [String(index), item]);
  if (value !== null && typeof value === "object") return Object.entries(value as Record<string, JsonValue>);
  return [];
}

export function containerCount(value: JsonValue): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") {
    return Object.keys(value as Record<string, JsonValue>).length;
  }
  return 0;
}

export function describeValue(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return `Array (${value.length})`;
  if (typeof value === "object") return `Object (${Object.keys(value).length})`;
  return typeof value;
}

export function previewOf(value: JsonValue, max = 60): string {
  if (value === null) return "null";
  if (typeof value === "string") {
    const flat = value.replace(/\s+/g, " ").trim();
    return flat.length > max ? `${flat.slice(0, max)}…` : flat;
  }
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return describeValue(value);
}

const KEY_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Converts a path of segments to a readable key like `items[0].user.name`. */
export function pathToKey(path: ReadonlyArray<string | number>): string {
  let result = "";
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (typeof seg === "number") {
      result += `[${seg}]`;
    } else if (KEY_PATTERN.test(seg)) {
      result += i === 0 ? seg : `.${seg}`;
    } else {
      result += `[${JSON.stringify(seg)}]`;
    }
  }
  return result;
}
