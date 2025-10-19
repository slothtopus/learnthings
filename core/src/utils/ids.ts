//import { nanoid } from 'nanoid';
import { customAlphabet } from 'nanoid';

const ID_LENGTH = 21;
const nanoid = customAlphabet('0123456789_abcdefghijklmnopqrstuvwxyz-');

export const generateId = () => {
  let id = nanoid(ID_LENGTH);
  // To avoid PouchDB error: only reserved document ids may start with underscore.
  while (id.startsWith('_')) {
    id = nanoid(ID_LENGTH);
  }
  return id;
};

export const combineIds = (ids: string[]) => ids.join('');

export const splitId = (id: string) => {
  const n_ids = id.length / ID_LENGTH;
  if (Math.floor(n_ids) != n_ids) {
    throw new Error(`splitId: id length must be a multiple of ${ID_LENGTH}`);
  }
  const ids: string[] = [];
  for (let i = 0; i < n_ids; i++) {
    ids.push(id.slice(ID_LENGTH * i, ID_LENGTH * (i + 1)));
  }
  return ids;
};

export const isValidId = (id: string) => id.length == ID_LENGTH;

export const mapIdKeys = <T extends Record<string, any>>(
  obj: T,
  mapFn: (val: string) => string
): T => {
  const clonedObj = { ...obj };

  const isIdField = (key: string) => {
    return key === '_id' || key.endsWith('Id') || key.endsWith('Ids');
  };

  const wrappedMapper = (
    val: any | any[],
    noArray = false
  ): string | string[] => {
    if (Array.isArray(val) && !noArray) {
      return val.map((v) => wrappedMapper(v, true)) as string[];
    } else if (typeof val == 'string') {
      return mapFn(val);
    } else {
      throw new Error(`Non string _id encountered: ${val}`);
    }
  };

  const recurse = (current: any): any => {
    if (Array.isArray(current)) {
      return current.map(recurse);
    } else if (typeof current === 'object' && current !== null) {
      return Object.fromEntries(
        Object.entries(current).map(([key, value]) => {
          try {
            const newEntry = [
              key,
              isIdField(key) ? wrappedMapper(value) : recurse(value),
            ];
            return newEntry;
          } catch (err) {
            throw new Error(`Error at: key = ${key}, value =${value}: ${err}`);
          }
        })
      );
    }
    return current;
  };

  return recurse(clonedObj);
};

export class IdMapper {
  minimise: boolean;

  nextMinimisedId = 0;
  lookup: Record<string, string> = {};

  constructor(minimise: boolean) {
    this.minimise = minimise;
  }

  getNextMinimisedId() {
    this.nextMinimisedId += 1;
    return String(this.nextMinimisedId);
  }

  map(id: string): string {
    if (!(id in this.lookup)) {
      this.lookup[id] = this.minimise
        ? this.getNextMinimisedId()
        : generateId();
    }
    return this.lookup[id];
  }

  mapObject<T extends Record<string, any>>(obj: T): T {
    return mapIdKeys(obj, (id: string) => this.map(id));
  }
}
