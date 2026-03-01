import { appendFileSync } from "fs";

const LOG_FILE = "debug.log";

export function log(message: string) {
  const timestamp = new Date().toISOString();
  appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}
