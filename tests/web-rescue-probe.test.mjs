import assert from "node:assert/strict";
import test from "node:test";

import { ROUTE_NAMES } from "../src/types.ts";
import {
  BROWSER_DETECTION_NOTE,
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS,
  formatDoctorSummary,
  webRescueProbe,
} from "../src/web_rescue_probe.ts";

test("webRescueProbe returns all four routes", () => {
  const result = webRescueProbe();

  assert.equal(result.routes.length, 4);
  assert.deepEqual(
    result.routes.map((route) => route.name),
    [...ROUTE_NAMES],
  );
});

test("webRescueProbe includes availability flags and default limits", () => {
  const result = webRescueProbe();

  for (const route of result.routes) {
    assert.equal(typeof route.available, "boolean");
    assert.equal(route.default_timeout_ms, DEFAULT_TIMEOUT_MS);
    assert.equal(route.default_max_bytes, DEFAULT_MAX_BYTES);
  }

  const nativeFetch = result.routes.find((route) => route.name === "native_fetch");
  assert.equal(nativeFetch?.status, "available");
  assert.equal(nativeFetch?.available, true);
});

test("playwright_cli is detection-only with browser note", () => {
  const result = webRescueProbe();
  const playwright = result.routes.find((route) => route.name === "playwright_cli");

  assert.equal(playwright?.status, "detection_only");
  assert.equal(playwright?.available, false);
  assert.equal(playwright?.note, BROWSER_DETECTION_NOTE);
  assert.equal(result.browser_note, BROWSER_DETECTION_NOTE);
});

test("deep=true preserves the ordered failure chain metadata", () => {
  const shallow = webRescueProbe();
  const deep = webRescueProbe({ deep: true });

  assert.equal(shallow.failure_chain, undefined);
  assert.deepEqual(deep.failure_chain, [
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
    { route: "playwright_cli", reason: "detection_only" },
  ]);
});

test("failure-chain reasons and fallbacks stay aligned with route metadata", () => {
  const result = webRescueProbe({ deep: true });
  const routesByName = new Map(result.routes.map((route) => [route.name, route]));

  assert.equal(result.failure_chain?.length, result.routes.length);
  for (const [index, entry] of result.failure_chain.entries()) {
    const route = routesByName.get(entry.route);
    assert.ok(route);
    assert.equal(
      entry.reason,
      route.status === "detection_only" ? "detection_only" : "not_implemented",
    );
    assert.equal(entry.fallback, result.routes[index + 1]?.name);
  }
});

test("formatDoctorSummary includes route names and browser note", () => {
  const result = webRescueProbe();
  const summary = formatDoctorSummary(result);

  assert.match(summary, /native_fetch/);
  assert.match(summary, /rss_atom_parse/);
  assert.match(summary, /html_excerpt/);
  assert.match(summary, /playwright_cli/);
  assert.match(summary, /detection-only/);
});

test("webRescueProbe never throws", () => {
  assert.doesNotThrow(() => webRescueProbe());
  assert.doesNotThrow(() => webRescueProbe({ deep: true }));
});
