import "server-only";

import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export const mdxRenderOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm as never],
    rehypePlugins: [rehypeSlug as never],
  },
};
