import { build } from "esbuild";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const commands = ["view-json"];
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

// dist/ is a self-contained, Tinycast-installable extension directory:
// package.json + one <command>.js per command + icon at the root, the
// layout ExtensionCatalog.install expects (byte-for-byte Raycast's own).
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const command of commands) {
  await build({
    entryPoints: [`src/${command}.tsx`],
    outfile: join(dist, `${command}.js`),
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "es2022",
    external: ["@raycast/api", "react", "react-dom", "fs", "os", "path"],
    sourcemap: false,
    minify: false,
    logLevel: "info",
  });
}

cpSync(join(root, "package.json"), join(dist, "package.json"));
cpSync(join(root, "icon.png"), join(dist, "icon.png"));

console.log(`Built ${commands.length} commands into dist/ (Tinycast-ready)`);
