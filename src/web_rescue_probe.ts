/**
 * pi-web-rescue — route capability probe (walking skeleton)
 *
 * Returns fixed-but-real route metadata. No remote network fetching in slice 01.
 */

import type {
  FailureChainEntry,
  RouteProbeResult,
  WebRescueProbeResult,
} from "./types.ts";
import { ROUTE_NAMES } from "./types.ts";

export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_BYTES = 5_242_880;

export const BROWSER_DETECTION_NOTE =
  "playwright_cli is detection-only in this slice; no browser automation runs.";

export interface WebRescueProbeOptions {
  deep?: boolean;
}

function buildRoute(name: (typeof ROUTE_NAMES)[number]): RouteProbeResult {
  if (name === "playwright_cli") {
    return {
      name,
      status: "detection_only",
      available: false,
      default_timeout_ms: DEFAULT_TIMEOUT_MS,
      default_max_bytes: DEFAULT_MAX_BYTES,
      note: BROWSER_DETECTION_NOTE,
    };
  }

  return {
    name,
    status: "available",
    available: true,
    default_timeout_ms: DEFAULT_TIMEOUT_MS,
    default_max_bytes: DEFAULT_MAX_BYTES,
  };
}

function buildFailureChain(): FailureChainEntry[] {
  return [
    {
      route: "native_fetch",
      reason: "not_implemented",
      fallback: "rss_atom_parse",
    },
    {
      route: "rss_atom_parse",
      reason: "not_implemented",
      fallback: "html_excerpt",
    },
    {
      route: "html_excerpt",
      reason: "not_implemented",
      fallback: "playwright_cli",
    },
    {
      route: "playwright_cli",
      reason: "detection_only",
    },
  ];
}

/**
 * Probe Web Rescue route capabilities.
 */
export function webRescueProbe(
  options: WebRescueProbeOptions = {},
): WebRescueProbeResult {
  const routes = ROUTE_NAMES.map((name) => buildRoute(name));

  const result: WebRescueProbeResult = {
    routes,
    browser_note: BROWSER_DETECTION_NOTE,
  };

  if (options.deep) {
    result.failure_chain = buildFailureChain();
  }

  return result;
}

/**
 * Human-readable route summary for /web-rescue:doctor and CLI output.
 */
export function formatDoctorSummary(result: WebRescueProbeResult): string {
  const lines = ["Web Rescue route status:", ""];

  for (const route of result.routes) {
    const flag = route.available ? "yes" : "no";
    lines.push(`  ${route.name}: ${route.status} (available=${flag})`);
    lines.push(
      `    timeout=${route.default_timeout_ms}ms max_bytes=${route.default_max_bytes}`,
    );
    if (route.note) {
      lines.push(`    note: ${route.note}`);
    }
  }

  lines.push("");
  lines.push(result.browser_note);

  return lines.join("\n");
}
