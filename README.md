# pi-web-rescue

> Web route probe + deterministic URL/RSS/HTML fetch fallback for Pi.

`pi-web-rescue` is a Pi extension that reports which Web Rescue fetch routes are available before any network behavior is implemented. Slice 01 ships a walking skeleton: the `web_rescue_probe` tool and `/web-rescue:doctor` command return fixed-but-real route metadata with no remote fetching.

## Install

```bash
pi install npm:pi-web-rescue
```

Install into the current project:

```bash
pi install npm:pi-web-rescue -l
```

Local dogfood during development:

```bash
npm install
npm run ci
pi -e .
```

## Usage

### Pi slash command

```txt
/web-rescue:doctor
```

Prints a short human-readable summary of route availability, default limits, and the browser detection note.

### Pi tool

Agents can call `web_rescue_probe` directly. Optional parameter: `{ "deep": true }` to include planned failure-chain metadata.

Example response:

```json
{
  "routes": [
    {
      "name": "native_fetch",
      "status": "available",
      "available": true,
      "default_timeout_ms": 30000,
      "default_max_bytes": 5242880
    },
    {
      "name": "playwright_cli",
      "status": "detection_only",
      "available": false,
      "default_timeout_ms": 30000,
      "default_max_bytes": 5242880,
      "note": "playwright_cli is detection-only in this slice; no browser automation runs."
    }
  ],
  "browser_note": "playwright_cli is detection-only in this slice; no browser automation runs."
}
```

### CLI

```bash
npx web-rescue-doctor
```

## Development

```bash
npm install
npm run ci
pi -e .
```

## Scope (slice 01)

- Route probe and doctor surfaces only
- No remote network fetching
- `playwright_cli` is detection-only
- Core types (`RouteProbeResult`, `RouteStatus`, `FailureChainEntry`) are unit-testable without Pi runtime APIs

## License

MIT
