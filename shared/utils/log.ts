// warning: something happened that shouldn't have, but we won't do anything about it because it's mostly fine
// error: something breaking happened, we may have taken corrective action to avoid it
type LogLevel = "WARNING" | "ERROR";

const log = (level: LogLevel) => (msg: string) =>
  console.log(`[${level}] ${msg}`);

export const logWarning = log("WARNING");
export const logError = log("ERROR");
