import { JSONPath } from "jsonpath-plus";
import { JsonValue } from "./json";

export type JsonPathMatch = { path: string; value: JsonValue };

export type JsonPathResult =
  | { ok: true; matches: JsonPathMatch[] }
  | { ok: false; error: string };

type RawMatch = { path: string | unknown[]; value: unknown };

export function queryJsonPath(root: JsonValue, expr: string): JsonPathResult {
  const trimmed = expr.trim();
  if (!trimmed) return { ok: false, error: "JSONPath expression is empty." };
  try {
    const results = JSONPath({ path: trimmed, json: root, resultType: "all" }) as RawMatch[];
    return {
      ok: true,
      matches: results.map((match) => ({
        path: typeof match.path === "string" ? match.path : JSON.stringify(match.path),
        value: match.value as JsonValue,
      })),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
