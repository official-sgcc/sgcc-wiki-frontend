import assert from 'node:assert/strict';
import test from 'node:test';

import { sortDocuments } from '../src/component/util/DocumentListSort.js';

const documents = [
  { title: 'old', like_count: 2, view_count: 10, updated_at: '2026-01-01T00:00:00Z' },
  { title: 'new', like_count: 2, view_count: 10, updated_at: '2026-01-03T00:00:00Z' },
  { title: 'viewed', like_count: 2, view_count: 20, updated_at: '2026-01-02T00:00:00Z' },
  { title: 'liked', like_count: 3, view_count: 1, updated_at: '2026-01-01T00:00:00Z' },
];

test('likes sort by likes, then views, then latest update', () => {
  assert.deepEqual(sortDocuments(documents, 'likes').map((doc) => doc.title),
    ['liked', 'viewed', 'new', 'old']);
});

test('views sort by views, then latest update', () => {
  assert.deepEqual(sortDocuments(documents, 'views').map((doc) => doc.title),
    ['viewed', 'new', 'old', 'liked']);
});
