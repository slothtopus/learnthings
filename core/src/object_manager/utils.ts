import { PersistableObject } from "./PersistableObject";
import { isEqual, pick } from "lodash-es";

export class ProgressMonitor {
  total: number | undefined;
  completed = 0;
  message?: string
  

  setMessage(message?: string) {
    this.message = message
  }

  getProgress() {
    if (this.total) {
      return (this.completed / this.total) * 100;
    } else {
      return undefined;
    }
  }
}

type CacheEntry<T> = { version: Record<string, number>; result: T };

export function cacheByVersion(doctypes: string[] = ["default"]) {
  return function <
    This extends PersistableObject<any>,
    Ret extends PersistableObject<any>[],
  >(
    original: (this: This) => Ret,
    context: ClassMethodDecoratorContext<This, (this: This) => Ret>,
  ) {
    if (context.kind !== "method") {
      throw new Error("@cacheByVersion must be used on a method");
    }

    const prop = `__${String(context.name)}Cache` as keyof This;

    const wrapped = function (this: This, skipCache = false): Ret {
      const currentVersion = pick(this.objectManager.version, doctypes);
      const entry = (this as any)[prop] as CacheEntry<Ret> | undefined;

      if (!skipCache && entry && isEqual(entry.version, currentVersion)) {
        return entry.result.filter((r) => !r.shouldDelete()) as Ret;
      }

      const result = original.call(this) as Ret;
      (this as any)[prop] = {
        version: currentVersion,
        result,
      } as CacheEntry<Ret>;
      console.log(
        `caching ${String(prop)} for version ${JSON.stringify(currentVersion)}`,
      );
      return result;
    };

    return wrapped;
  };
}