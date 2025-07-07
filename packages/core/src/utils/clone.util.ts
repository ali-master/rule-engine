export function clone<T>(data: T): T {
  return structuredClone(data);
}
