export function kindOf(inp: any): string {
  return Object.prototype.toString.call(inp).slice(8, -1).toLowerCase();
}

export function isObject(inp: any) {
  return kindOf(inp) === "object";
}
