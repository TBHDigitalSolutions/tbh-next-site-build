/** Minimal logger with --verbose and --quiet flags */
const argv = process.argv.slice(2);
const VERBOSE = argv.includes("--verbose");
const QUIET = argv.includes("--quiet");

export const logger = {
  info: (...args: any[]) => { if (!QUIET) console.log(...args); },
  warn: (...args: any[]) => { if (!QUIET) console.warn(...args); },
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => { if (VERBOSE && !QUIET) console.debug(...args); },
};

export function exitOk(msg?: string) {
  if (msg) logger.info(msg);
  process.exit(0);
}
export function exitFail(msg?: string) {
  if (msg) logger.error(msg);
  process.exit(1);
}