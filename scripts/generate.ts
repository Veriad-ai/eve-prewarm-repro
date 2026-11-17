// Generates a ~4.7 MB shared catalog and 100 tools that each import it.
import { mkdirSync, writeFileSync } from "node:fs";

const TOOL_COUNT = Number(process.env.TOOL_COUNT ?? 100);
const word = (i: number) => (i * 2654435761).toString(36).slice(0, 8);

mkdirSync("agent/lib", { recursive: true });
mkdirSync("agent/tools", { recursive: true });

const catalog = Array.from({ length: 5000 }, (_, i) => ({
  id: `app_${i}`,
  name: word(i + 1),
  description: Array.from({ length: 40 }, (_, j) => word(i * 40 + j)).join(" "),
  actions: Array.from({ length: 8 }, (_, j) => ({ slug: `a${i}_${j}`, params: { x: "string", y: "number" } })),
}));
writeFileSync("agent/lib/catalog.json", JSON.stringify(catalog));

for (let i = 0; i < TOOL_COUNT; i++) {
  const name = `tool_${String(i).padStart(3, "0")}`;
  writeFileSync(
    `agent/tools/${name}.ts`,
    `import { defineTool } from "eve/tools";
import { z } from "zod";
import { findApp } from "../lib/catalog";

export default defineTool({
  description: "Look up app ${i} in the shared catalog.",
  inputSchema: z.object({ id: z.string() }),
  async execute({ id }) {
    return { app: findApp(id)?.name ?? null };
  },
});
`,
  );
}
