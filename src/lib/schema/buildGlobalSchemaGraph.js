function normalizeSiteUrl(domain) {
  const d = (domain || "").trim();
  if (!d) return "http://localhost:3000";
  return d.replace(/\/$/, "");
}

function stripHtml(s) {
  if (!s || typeof s !== "string") return "";
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryTelephone(contactInfo) {
  if (!Array.isArray(contactInfo)) return undefined;
  const raw = contactInfo.find((c) => c?.phone_number)?.phone_number;
  if (!raw || typeof raw !== "string") return undefined;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return undefined;
  return raw.replace(/\s+/g, " ").trim();
}

function sameAsUrls(socialLinks) {
  if (!Array.isArray(socialLinks)) return [];
  return socialLinks
    .map((l) => l?.social_media_url)
    .filter((u) => typeof u === "string" && /^https?:\/\//i.test(u));
}

export function buildGlobalSchemaGraph(themeOptions) {
  const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_DOMAIN);
  const orgId = `${siteUrl}/#organization`;
  const websiteId = `${siteUrl}/#website`;
  const localId = `${siteUrl}/#localbusiness`;

  const siteName =
    (themeOptions && themeOptions.site_name) ||
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "Encircle Technologies Pvt. Ltd.";

  const logoUrlRaw = themeOptions?.header_logo?.url;
  const logoUrl =
    typeof logoUrlRaw === "string" && logoUrlRaw.length > 0
      ? logoUrlRaw.startsWith("http")
        ? logoUrlRaw
        : `${siteUrl}${logoUrlRaw.startsWith("/") ? "" : "/"}${logoUrlRaw}`
      : `${siteUrl}/logo.svg`;

  const telephone = primaryTelephone(themeOptions?.contact_info);
  const email = typeof themeOptions?.email === "string" ? themeOptions.email.trim() : undefined;
  const street = themeOptions?.address ? stripHtml(themeOptions.address) : "";
  const sameAs = sameAsUrls(themeOptions?.social_media_links);

  const organization = {
    "@type": "Organization",
    "@id": orgId,
    name: siteName,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl,
    },
  };
  if (sameAs.length) organization.sameAs = sameAs;
  if (email) organization.email = email;
  if (telephone) organization.telephone = telephone;

  const localBusiness = {
    "@type": "ProfessionalService",
    "@id": localId,
    name: siteName,
    url: siteUrl,
    parentOrganization: { "@id": orgId },
  };
  if (street) {
    localBusiness.address = {
      "@type": "PostalAddress",
      streetAddress: street,
    };
  }
  if (telephone) localBusiness.telephone = telephone;
  if (email) localBusiness.email = email;
  if (logoUrl) localBusiness.image = logoUrl;

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: `${siteUrl}/`,
    name: siteName,
    publisher: { "@id": orgId },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, localBusiness, website],
  };
}
