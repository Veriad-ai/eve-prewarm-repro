// Applies the proposed fix to the installed eve 1.0.1: sandbox prewarm loads the
// authored module map as one bundle. Undo with `rm -rf node_modules && bun install`.
import { readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const eve = realpathSync("node_modules/eve");
const edits: Record<string, [string, string][]> = {
  "dist/src/execution/sandbox/prewarm.js": [
    [
      "loadCompiledModuleMapFromAuthoredSource({compiledArtifactsSource:e.compiledArtifactsSource})",
      "loadCompiledModuleMapFromAuthoredSource({compiledArtifactsSource:e.compiledArtifactsSource,singleBundle:!0})",
    ],
  ],
  "dist/src/internal/authored-module-map-loader.js": [
    [
      "e.compiledArtifactsSource.appRoot,e.authoredAppRoot)}",
      "e.compiledArtifactsSource.appRoot,e.authoredAppRoot,e.singleBundle)}",
    ],
    [
      "hydrateCompiledModuleMapFromManifest(e,t,n=e.appRoot){",
      "hydrateCompiledModuleMapFromManifest(e,t,n=e.appRoot,singleBundle=!1){",
    ],
    ["runtimeAppRoot:t});if([e,", "runtimeAppRoot:t});if(singleBundle||[e,"],
  ],
};

for (const [file, replacements] of Object.entries(edits)) {
  const path = join(eve, file);
  let source = readFileSync(path, "utf8");
  for (const [from, to] of replacements) {
    if (!source.includes(from)) throw new Error(`${file}: pattern not found (already applied, or not eve 1.0.1)`);
    source = source.replace(from, to);
  }
  // Write a new file and rename it over the old one: bun hardlinks node_modules to
  // its global cache, so writing in place would patch eve for every project.
  writeFileSync(`${path}.tmp`, source);
  renameSync(`${path}.tmp`, path);
  console.log(`patched ${file}`);
}
