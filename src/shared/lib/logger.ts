type LogLevel = "debug" | "info" | "warn" | "error"

interface RequestLogFields {
  method: string
  path: string
  status: number
  durationMs: number
}

function write(level: LogLevel, message: string, fields?: object): void {
  const line = JSON.stringify({ level, message, ...fields })

  if (level === "error") {
    console.error(line)
  } else if (level === "warn") {
    console.warn(line)
  } else {
    console.log(line)
  }
}

/**
 * Shared logging wrapper (Constitution Principle XV) — the only place
 * `console.*` should be called from feature code, so verbosity/destination
 * can be changed in one place.
 */
export const logger = {
  /** No-op in production builds; use for local-only diagnostic output. */
  debug(message: string, fields?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === "production") {
      return
    }
    write("debug", message, fields)
  },
  info(message: string, fields?: Record<string, unknown>): void {
    write("info", message, fields)
  },
  warn(message: string, fields?: Record<string, unknown>): void {
    write("warn", message, fields)
  },
  error(message: string, fields?: Record<string, unknown>): void {
    write("error", message, fields)
  },
  /** Structured method/path/status/duration log line for a Route Handler request. */
  request(fields: RequestLogFields): void {
    write("info", "request", fields)
  },
}
