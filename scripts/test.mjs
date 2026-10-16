import { spawnSync } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const build = spawnSync(process.execPath, [join(root, "scripts/build.mjs"), "--test"], { stdio: "inherit" })
if (build.status !== 0) process.exit(build.status ?? 1)
const test = spawnSync(process.execPath, ["--test", join(root, "dist/tests/convert.test.cjs")], { stdio: "inherit" })
process.exit(test.status ?? 1)
