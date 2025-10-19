import { test, expect } from 'vitest';

import {
  getFilenameFromUrl,
  getMimeTypeFromUrl,
  fetchMetadata,
  createAttachmentFromURL,
} from './attachments';

test('getFilenameFromUrl', () => {
  expect(
    getFilenameFromUrl(
      'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Andorra.svg'
    )
  ).toEqual('Flag_of_Andorra.svg');
});

test('getMimeTypeFromUrl', () => {
  expect(
    getMimeTypeFromUrl(
      'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Andorra.svg'
    )
  ).toEqual('image/svg+xml');
});

test('fetchMetadata', async () => {
  expect(
    await fetchMetadata(
      'https://upload.wikimedia.org/wikipedia/commons/1/19/Flag_of_Andorra.svg'
    )
  ).toEqual({ filename: 'Flag_of_Andorra.svg', mimetype: 'image/svg+xml' });
});
