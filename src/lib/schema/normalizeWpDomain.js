export function normalizeWpDomain(schema, wpDomain, siteDomain) {
  if (!schema || !wpDomain || wpDomain === siteDomain) return schema;
  return JSON.parse(JSON.stringify(schema).replaceAll(wpDomain, siteDomain));
}
