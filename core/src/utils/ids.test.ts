import { test, expect } from 'vitest';

import { generateId, combineIds, splitId } from './ids';

test('id combination and splitting', () => {
  const ids = [generateId(), generateId(), generateId()];
  const combinedId = combineIds(ids);
  const splitIds = splitId(combinedId);
  expect(ids).toEqual(splitIds);
});
