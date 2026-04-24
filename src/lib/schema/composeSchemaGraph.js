function getSchemaTypes(node) {
  const t = node?.["@type"];
  if (Array.isArray(t)) return t.filter((x) => typeof x === "string");
  return typeof t === "string" ? [t] : [];
}

function normalizeToGraph(schema) {
  if (!schema || typeof schema !== "object") return [];
  if (Array.isArray(schema)) return schema.filter((n) => n && typeof n === "object");
  if (Array.isArray(schema["@graph"]))
    return schema["@graph"].filter((n) => n && typeof n === "object");
  if (schema["@context"] || schema["@type"] || schema["@id"]) return [schema];
  return [];
}

// Types that should appear at most once per page — deduplicate by type alone
// so Yoast's @id-bearing node and our @id-less node both resolve to the same key.
const SINGLETON_TYPES = new Set(["FAQPage", "BreadcrumbList", "Service"]);

function schemaKey(node) {
  if (!node || typeof node !== "object") return "";
  const typeList = getSchemaTypes(node);
  const types = typeList.slice().sort().join(",");

  // Singleton types: ignore @id/url/name — type alone is the dedup key.
  // Yoast sometimes outputs multi-typed nodes like ["BreadcrumbList","ItemList"].
  // Treat any node that *includes* a singleton type as that singleton for deduping.
  for (const singleton of SINGLETON_TYPES) {
    if (typeList.includes(singleton)) return `t:${singleton}`;
  }

  const id = typeof node["@id"] === "string" ? node["@id"] : "";
  if (id) return `id:${id}`;

  const url = typeof node.url === "string" ? node.url : "";
  const name = typeof node.name === "string" ? node.name : "";
  const headline = typeof node.headline === "string" ? node.headline : "";

  if (types && url) return `t:${types}|u:${url}`;
  if (types && name) return `t:${types}|n:${name}`;
  if (types && headline) return `t:${types}|h:${headline}`;
  if (types) return `t:${types}`;
  return "";
}

export function hasSchemaType(schema, type) {
  const graph = normalizeToGraph(schema);
  return graph.some((node) => getSchemaTypes(node).includes(type));
}

/**
 * Compose a single Schema.org graph from multiple sources.
 * Preference order: yoast -> global -> extras (so Yoast wins on duplicates).
 */
export function composeSchemaGraph({ yoastSchema, globalSchema, extras = [] }) {
  const yoastGraph = normalizeToGraph(yoastSchema);
  const globalGraph = normalizeToGraph(globalSchema);
  const extrasGraph = normalizeToGraph({ "@graph": extras });

  const out = [];
  const seen = new Set();

  for (const node of [...yoastGraph, ...globalGraph, ...extrasGraph]) {
    if (!node || typeof node !== "object") continue;
    const key = schemaKey(node);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(node);
  }

  if (!out.length) return null;

  return {
    "@context": "https://schema.org",
    "@graph": out,
  };
}
