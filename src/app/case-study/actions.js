"use server";
import getCaseStudyList from "@/services/case-studies/getCaseStudyList";

export async function searchCaseStudiesAction(page, search = "") {
  return await getCaseStudyList({ page, search });
}
