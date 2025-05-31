export class Logger {
  static debug(...opts: any[]): void {
    if (!process.env.DEBUG) return;
    console.debug(...opts);
  }
}
