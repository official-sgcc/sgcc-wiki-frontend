import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownRehypePlugins } from "../src/component/util/MarkdownSecurity.js";

function render(content) {
  return renderToStaticMarkup(React.createElement(Markdown,
    { rehypePlugins: markdownRehypePlugins, remarkPlugins: [remarkGfm] }, content));
}

test("untrusted HTML cannot embed scripts, active frames or event handlers", () => {
  const result = render('<iframe srcdoc="<script>parent.document.title=1</script>"></iframe>' +
    '<script>alert(1)</script><img src="x" onerror="alert(1)">' +
    '<a href="javascript:alert(1)">link</a><svg onload="alert(1)"></svg>');
  assert.doesNotMatch(result, /iframe|srcDoc|<script|onerror|onload|javascript:|<svg/i);
});

test("normal markdown, alignment, tables and task lists survive", () => {
  const result = render('<div align="center">Centered</div>\n\n**bold**\n\n- [x] done\n\n| A | B |\n| - | - |\n| 1 | 2 |');
  assert.match(result, /align="center"/);
  assert.match(result, /<strong>bold<\/strong>/);
  assert.match(result, /<table>/);
  assert.match(result, /type="checkbox" disabled=""/);
});
