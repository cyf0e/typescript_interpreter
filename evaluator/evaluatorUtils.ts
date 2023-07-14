export function raise(e: string) {
  throw new Error(e);
}
export function assertDefined(value: any, err: string) {
  if (value === undefined) raise(err ?? `${value} is undefined.`);
  return true;
}
export function assertUndefined(value: any, err: string) {
  if (value === undefined) return true;
  raise(err ?? `${value} is not undefined.`);
}
export function assertValid(value: any, err: string) {
  if (value === undefined || value === null)
    raise(err ?? `${value} is not undefined.`);
  return true;
}
export function assertNumber(value: any) {
  if (typeof value === "number") return true;
  raise(`${value} must be a number.`);
}

export function assertString(value: any) {
  if (typeof value === "string") return true;
  raise(`${value} must be string.`);
}
