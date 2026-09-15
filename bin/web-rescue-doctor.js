#!/usr/bin/env node

/**
 * pi-web-rescue CLI entry point
 *
 * Prints a human-readable route summary to stdout.
 */

import {
  formatDoctorSummary,
  webRescueProbe,
} from "../src/web_rescue_probe.ts";

const result = webRescueProbe();
process.stdout.write(formatDoctorSummary(result) + "\n");
