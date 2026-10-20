/**
 * pi-web-rescue — route capability probe (walking skeleton)
 *
 * Returns fixed-but-real route metadata. No remote network fetching in slice 01.
 */

import type {
  FailureChainEntry,
  RouteName,
  RouteProbeResult,
  WebRescueProbeResult,
} from "./types.ts";
import { ROUTE_NAMES } from "./types.ts";

export const DEFAULT_TIMEOUT_MS = 30_000;
export const DEFAULT_MAX_BYTES = 5_242_880;

export const BROWSER_DETECTION_NOTE =
  "playwright_cli is detection-only in this slice; no browser automation runs.";

type RouteMetadata = Pick<RouteProbeResult, "status" | "available" | "note"> & {
  failureReason: FailureChainEntry["reason"];
};

const ROUTE_METADATA: Record<RouteName, RouteMetadata> = {
  native_fetch: {
    status: "available",
    available: true,
    failureReason: "not_implemented",
  },
  rss_atom_parse: {
    status: "available",
    available: true,
    failureReason: "not_implemented",
  },
  html_excerpt: {
    status: "available",
    available: true,
    failureReason: "not_implemented",
  },
  playwright_cli: {
    status: "detection_only",
    available: false,
    note: BROWSER_DETECTION_NOTE,
    failureReason: "detection_only",
  },
};

export interface WebRescueProbeOptions {
  deep?: boolean;
}

function buildRoute(name: (typeof ROUTE_NAMES)[number]): RouteProbeResult {
  const metadata = ROUTE_METADATA[name];

  return {
    name,
    status: metadata.status,
    available: metadata.available,
    default_timeout_ms: DEFAULT_TIMEOUT_MS,
    default_max_bytes: DEFAULT_MAX_BYTES,
    ...(metadata.note === undefined ? {} : { note: metadata.note }),
  };
}

function buildFailureChain(): FailureChainEntry[] {
  return ROUTE_NAMES.map((route, index) => {
    const fallback = ROUTE_NAMES[index + 1];
    return {
      route,
      reason: ROUTE_METADATA[route].failureReason,
      ...(fallback === undefined ? {} : { fallback }),
    };
  });
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
