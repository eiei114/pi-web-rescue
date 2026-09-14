/**
 * pi-web-rescue Pi extension
 *
 * Registers the `web_rescue_probe` tool and `/web-rescue:doctor` slash command.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import {
  formatDoctorSummary,
  webRescueProbe,
  type WebRescueProbeOptions,
} from "../src/web_rescue_probe.ts";
import type { WebRescueProbeResult } from "../src/types.ts";

const probeParameters = Type.Object({
  deep: Type.Optional(Type.Boolean()),
});

export default function (pi: ExtensionAPI) {
  pi.registerCommand("web-rescue:doctor", {
    description:
      "Summarize Web Rescue route availability, limits, and browser detection notes",
    handler: async (_args, ctx) => {
      const result = webRescueProbe();
      const summary = formatDoctorSummary(result);

      if (ctx.hasUI) {
        ctx.ui.notify("Web Rescue route summary ready", "info");
      }

      console.log(summary);
    },
  });

  pi.registerTool({
    name: "web_rescue_probe",
    label: "Web Rescue Probe",
    description:
      "Return Web Rescue route names, availability flags, default limits, and browser detection notes as JSON",
    promptSnippet:
      "web_rescue_probe: inspect Web Rescue fetch route capabilities before network work",
    promptGuidelines: [
      "Use web_rescue_probe before attempting URL/RSS/HTML fetch through Web Rescue.",
      "This slice is probe-only — it does not perform remote network fetching.",
      "Pass deep=true to include the planned failure-chain metadata.",
    ],
    parameters: probeParameters,
    async execute(_toolCallId, params, signal, _onUpdate, _ctx) {
      if (signal?.aborted) {
        return { content: [{ type: "text", text: "Cancelled" }], details: {} };
      }

      const options = params as WebRescueProbeOptions;
      const result = webRescueProbe(options);
      const formatted = JSON.stringify(result, null, 2);

      return {
        content: [{ type: "text", text: formatted }],
        details: result,
      };
    },

    renderCall(args, theme, _context) {
      const deep = (args as WebRescueProbeOptions).deep === true;
      const suffix = deep ? theme.fg("dim", " deep") : "";
      return new Text(
        theme.fg("toolTitle", theme.bold("web_rescue_probe")) + suffix,
        0,
        0,
      );
    },

    renderResult(result, { expanded }, theme, _context) {
      const details = result.details as WebRescueProbeResult | undefined;
      const availableCount =
        details?.routes.filter((route) => route.available).length ?? 0;
      const total = details?.routes.length ?? 0;

      let text =
        theme.fg("success", `→ ${availableCount}/${total} routes available`) +
        theme.fg("dim", " (probe-only slice)");

      if (expanded && details) {
        const names = details.routes.map((route) => route.name).join(", ");
        text += `\n${theme.fg("dim", names)}`;
      }

      return new Text(text, 0, 0);
    },
  });
}
