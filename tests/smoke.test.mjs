import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const ciWorkflow = await readFile(
  new URL("../.github/workflows/ci.yml", import.meta.url),
  "utf8",
);
const registerExtension = (await import("../extensions/index.ts")).default;

test("package declares pi extension", () => {
  assert.deepEqual(packageJson.pi.extensions, ["./extensions"]);
});

test("package declares web-rescue:doctor command", () => {
  assert.equal(
    packageJson.pi.commands["web-rescue:doctor"],
    "./bin/web-rescue-doctor.js",
  );
});

test("package is discoverable as a Pi package", () => {
  assert.ok(packageJson.keywords.includes("pi-package"));
});

test("package uses public publish config", () => {
  assert.equal(packageJson.publishConfig.access, "public");
});

test("ci workflow runs tests on push and pull_request", () => {
  assert.match(ciWorkflow, /on:\s*[\s\S]*push:/);
  assert.match(ciWorkflow, /pull_request:/);
  assert.match(ciWorkflow, /npm run ci/);
});

test("extension module loads and registers web_rescue_probe tool", () => {
  assert.equal(typeof registerExtension, "function");

  const commands = [];
  const tools = [];

  registerExtension({
    registerCommand(name, spec) {
      commands.push({ name, ...spec });
    },
    registerTool(spec) {
      tools.push(spec);
    },
  });

  assert.equal(commands.length, 1);
  assert.equal(commands[0].name, "web-rescue:doctor");
  assert.match(commands[0].description, /Web Rescue route/i);
  assert.equal(typeof commands[0].handler, "function");

  assert.equal(tools.length, 1);
  assert.equal(tools[0].name, "web_rescue_probe");
  assert.equal(typeof tools[0].execute, "function");
});
