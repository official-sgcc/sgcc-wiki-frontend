import assert from 'node:assert/strict';
import test from 'node:test';
import { saveEditedDocument } from '../src/component/util/DocumentSaveFlow.js';

test('renames before updating and uses the new title', async () => {
  const calls = [];
  await saveEditedDocument({ currentTitle: 'Old', nextTitle: 'New', content: 'body', tags: [], category: {} }, {
    rename: async (...args) => calls.push(['rename', ...args]),
    update: async (...args) => calls.push(['update', ...args]),
    onRenamed: (title) => calls.push(['renamed', title]),
  });
  assert.deepEqual(calls, [
    ['rename', 'Old', 'New'],
    ['renamed', 'New'],
    ['update', 'New', 'body', [], {}],
  ]);
});

test('failed rename does not update the document', async () => {
  let updated = false;
  await assert.rejects(saveEditedDocument({ currentTitle: 'Old', nextTitle: 'New' }, {
    rename: async () => { throw Error('rename failed'); },
    update: async () => { updated = true; },
    onRenamed: () => { throw Error('should not be called'); },
  }), /rename failed/);
  assert.equal(updated, false);
});

test('failed body update can retry under the successfully renamed title', async () => {
  let currentTitle = 'Old';
  let renameCount = 0;
  let updateCount = 0;
  const actions = {
    rename: async () => { renameCount += 1; },
    update: async (title) => {
      assert.equal(title, 'New');
      updateCount += 1;
      if (updateCount === 1) throw Error('update failed');
    },
    onRenamed: (title) => { currentTitle = title; },
  };
  const fields = { nextTitle: 'New', content: 'body', tags: [], category: {} };
  await assert.rejects(saveEditedDocument({ ...fields, currentTitle }, actions), /update failed/);
  await saveEditedDocument({ ...fields, currentTitle }, actions);
  assert.equal(renameCount, 1);
  assert.equal(updateCount, 2);
});
