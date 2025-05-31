export function convertTimeToMs(timeString: string) {
  if (!isValidTime(timeString)) {
    throw new Error("Invalid time format");
  }

  const timeParts = timeString.split(":");
  // Extract hours, minutes (required), and optional seconds and milliseconds
  const [hours, minutes, seconds = 0, milliseconds = 0] = timeParts.map(Number);

  return hours! * 3600000 + minutes! * 60000 + seconds * 1000 + milliseconds;
}

export const timeRegex =
  /^([01]\d|2[0-3]):([0-5]\d)(?:[:.]([0-5]\d)(\.\d{1,3})?)?$/;
export function isValidTime(timeString: string) {
  return timeRegex.test(timeString);
}
