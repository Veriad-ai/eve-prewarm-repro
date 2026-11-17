# eve sandbox prewarm repro: build time grows with tools × shared imports

A fresh `eve init` app (eve 1.0.1) with three additions:

- `agent/sandbox.ts`: a `just-bash` sandbox, so `eve build` prewarms a template without any cloud credentials.
- `agent/lib/catalog.ts`: a shared module that imports a 4.3 MB JSON file, standing in for a large shared package.
- `agent/tools/tool_000.ts` … `tool_099.ts`: 100 tools that each import `findApp` from that shared module.

The catalog and tools are committed. `scripts/generate.ts` regenerates them; set `TOOL_COUNT` to change how many tools it writes.

## Steps

```sh
bun install
rm -rf node_modules/.cache .eve .output
time bun x eve build
du -sh node_modules/.cache/eve
```

To try the proposed fix, apply it to the installed eve and build again:

```sh
bun scripts/single-bundle.ts
rm -rf node_modules/.cache .eve .output
time bun x eve build
```

`rm -rf node_modules && bun install` restores stock eve.

## Results (Linux x64, 8 vCPU, Node 24, Bun 1.4.2)

| | eve 1.0.1 | with single-bundle prewarm |
|---|---|---|
| `eve build` wall time | 33.1 s | 4.2 s |
| peak RSS | 4.1 GB | 1.7 GB |
| `node_modules/.cache/eve` | 583 MB, 208 files | 7.1 MB, 106 files |

Almost all of the difference comes before `eve: initializing 1 sandbox template...`, which prints at 30.3 s on 1.0.1 and at 1.9 s with the change.
