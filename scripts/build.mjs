import { mkdirSync, copyFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import * as esbuild from "esbuild"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
mkdirSync(dist, { recursive: true })

const shared = {
  bundle: true,
  platform: "node",
  target: "es2022",
  format: "cjs",
  external: ["electron"],
  logLevel: "info",
}

await esbuild.build({
  ...shared,
  entryPoints: [join(root, "src/main.ts")],
  outfile: join(dist, "main.js"),
})

await esbuild.build({
  ...shared,
  entryPoints: [join(root, "src/preload.ts")],
  outfile: join(dist, "preload.js"),
})

await esbuild.build({
  bundle: true,
  platform: "browser",
  target: "es2022",
  format: "iife",
  entryPoints: [join(root, "src/renderer.ts")],
  outfile: join(dist, "renderer.js"),
  logLevel: "info",
})

copyFileSync(join(root, "src/index.html"), join(dist, "index.html"))
copyFileSync(join(root, "src/styles.css"), join(dist, "styles.css"))
copyFileSync(join(root, "src/render.html"), join(dist, "render.html"))
copyFileSync(join(root, "src/logo.webp"), join(dist, "logo.webp"))
copyFileSync(join(root, "assets/icon.png"), join(dist, "icon.png"))

if (process.argv.includes("--test")) {
  const tests = join(dist, "tests")
  rmSync(tests, { recursive: true, force: true })
  mkdirSync(tests, { recursive: true })
  await esbuild.build({
    entryPoints: [join(root, "src/convert.test.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "es2022",
    outfile: join(tests, "convert.test.cjs"),
    external: ["node:test", "node:assert/strict"],
  })
}
