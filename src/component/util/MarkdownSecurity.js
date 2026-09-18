import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// Parse author-supplied HTML, then remove active content and unsafe attributes.
// The default schema retains div align, tables, images and GFM task lists.
export const markdownRehypePlugins = [rehypeRaw, rehypeSanitize];
