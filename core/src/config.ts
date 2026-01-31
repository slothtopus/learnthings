class Config {
  tokenGenerator?: () => Promise<string | undefined>;
  GENERATION_API_URL?: string;
}

export const config = new Config();

export const throwIfUndefined = <T>(val: T | undefined) => {
  if (val === undefined) {
    throw new Error("Value is undefined");
  } else {
    return val;
  }
};
