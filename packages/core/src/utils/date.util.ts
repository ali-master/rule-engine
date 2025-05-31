export function getDate(date = new Date()) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
}

export function dateWithTzOffset(date?: Date) {
  return getDate(new Date(date?.toISOString() ?? new Date().toISOString()));
}
