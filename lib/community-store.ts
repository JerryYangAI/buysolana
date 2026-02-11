import "server-only";

/**
 * @deprecated Local JSON community store is disabled.
 * Use Supabase-backed functions in `lib/community-supabase.ts` instead.
 */
export function getPosts() {
  throw new Error("community-store is deprecated. Use listPublishedPosts from lib/community-supabase.ts");
}

/**
 * @deprecated Local JSON community store is disabled.
 */
export function getPostById() {
  throw new Error("community-store is deprecated. Use getPublishedPostById from lib/community-supabase.ts");
}

/**
 * @deprecated Local JSON community store is disabled.
 */
export function createPost() {
  throw new Error("community-store is deprecated. Use Supabase API routes for writes");
}

/**
 * @deprecated Local JSON community store is disabled.
 */
export function addComment() {
  throw new Error("community-store is deprecated. Use Supabase API routes for writes");
}

/**
 * @deprecated Local JSON community store is disabled.
 */
export function createAsk() {
  throw new Error("community-store is deprecated. Use Supabase API routes for writes");
}
