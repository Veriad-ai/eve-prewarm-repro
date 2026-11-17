import { defineTool } from "eve/tools";
import { z } from "zod";
import { findApp } from "../lib/catalog";

export default defineTool({
  description: "Look up app 31 in the shared catalog.",
  inputSchema: z.object({ id: z.string() }),
  async execute({ id }) {
    return { app: findApp(id)?.name ?? null };
  },
});
