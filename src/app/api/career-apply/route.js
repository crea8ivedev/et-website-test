import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const CAREER_FORM_ID = process.env.NEXT_PUBLIC_CAREER_FORM_ID;

const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function POST(request) {
  if (!WP_URL || !CAREER_FORM_ID) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const resume = formData.get("input_9");
  if (resume instanceof File && resume.size > 0) {
    if (resume.size > MAX_RESUME_BYTES) {
      return NextResponse.json({ error: "Resume file exceeds 5 MB limit" }, { status: 400 });
    }
    if (!ALLOWED_RESUME_TYPES.has(resume.type)) {
      return NextResponse.json(
        { error: "Resume must be a PDF or Word document (.pdf, .doc, .docx)" },
        { status: 400 }
      );
    }
  }

  const wpUrl = `${WP_URL}/wp-json/gf/v2/forms/${encodeURIComponent(String(CAREER_FORM_ID))}/submissions`;
  try {
    const wpRes = await fetch(wpUrl, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(30000),
    });
    const data = await wpRes.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: wpRes.status });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 502 });
  }
}
