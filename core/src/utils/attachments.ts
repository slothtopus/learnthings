import mime from 'mime-types';
import { ofetch } from 'ofetch';

export type AttachmentData = {
  url?: string;
  filename: string;
  mimetype: string;
  data: Blob;
};

export const getFilenameFromUrl = (url: string): string | null => {
  const pathname = new URL(url).pathname;
  return pathname.split('/').pop() || null;
};

export const getMimeTypeFromUrl = (url: string): string | null => {
  const filename = getFilenameFromUrl(url);
  if (filename) {
    const mimetype = mime.lookup(filename);
    return mimetype ? mimetype : null;
  } else {
    return null;
  }
};

export const fetchMetadata = async (url: string) => {
  const response = await fetch(url, { method: 'HEAD' });

  const contentDisposition = response.headers.get('Content-Disposition');
  const contentType = response.headers.get('Content-Type');

  let filename = getFilenameFromUrl(url);
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+?)"/);
    if (match) filename = match[1];
  }

  return { filename, mimetype: contentType || getMimeTypeFromUrl(url) };
};

export const createAttachmentFromURL = async (url: string): Promise<AttachmentData> => {
  const { filename, mimetype } = await fetchMetadata(url);
  if (filename === null || mimetype === null) {
    throw new Error(`Unknown filetype for url ${url}`);
  }

  const blob = await ofetch(url, { responseType: 'blob' });
  return {
    url,
    filename,
    mimetype,
    data: blob,
  };
};

export const blobToBuffer = async (blob: Blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const bufferToBlob = (buffer: Buffer) => {
  const uint8Array = new Uint8Array(buffer);
  return new Blob([uint8Array]);
};

export const blobToBase64 = async (blob: Blob) => {
  const buffer = Buffer.from(await blob.arrayBuffer());
  return buffer.toString('base64');
};

export const areMimeTypesEqual = (mimetype1: string, mimetype2: string) => {
  const [type1, subtype1] = mimetype1.split('/');
  const [type2, subtype2] = mimetype2.split('/');
  return type1 === type2 && (subtype1 === '*' || subtype2 === '*' || subtype1 === subtype2);
};
