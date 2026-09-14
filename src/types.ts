/**
 * Core route and failure-chain types for pi-web-rescue.
 *
 * These types are unit-testable without Pi runtime APIs.
 */

export const ROUTE_NAMES = [
  "native_fetch",
  "rss_atom_parse",
  "html_excerpt",
  "playwright_cli",
] as const;

export type RouteName = (typeof ROUTE_NAMES)[number];

/** Whether a route can execute fetch work in the current slice. */
export type RouteStatus = "available" | "unavailable" | "detection_only";

export interface RouteProbeResult {
  name: RouteName;
  status: RouteStatus;
  available: boolean;
  default_timeout_ms: number;
  default_max_bytes: number;
  note?: string;
}

export interface FailureChainEntry {
  route: RouteName;
  reason: string;
  fallback?: RouteName;
}

export interface WebRescueProbeResult {
  routes: readonly RouteProbeResult[];
  browser_note: string;
  failure_chain?: readonly FailureChainEntry[];
}
