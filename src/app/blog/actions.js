"use server";
import getPostList from "@/services/posts/getPostList";

export async function loadMorePostsAction(
  page,
  search = "",
  categoryId = "",
  tagId = "",
  authorId = ""
) {
  return await getPostList({ page, search, categoryId, tagId, authorId });
}
