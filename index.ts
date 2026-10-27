import { basename, dirname, join, resolve } from "node:path";
import { unlink } from "node:fs/promises";

const args = Bun.argv.slice(2);
const prefixArg = args.find((a) => a.startsWith("--prefix="));
const prefix = prefixArg ? prefixArg.slice("--prefix=".length) : "PUBLIC_";
const input = args.find((a) => !a.startsWith("--"));

if (!input) {
  console.error("usage: bun index.ts <file.ts> [--prefix=PUBLIC_]");
  process.exit(1);
}

// camelCase / kebab-case / snake_case -> SCREAMING_SNAKE_CASE
const toEnvKey = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1_$2")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .toUpperCase();

// firebaseConfig -> FIREBASE
const toGroup = (name: string) =>
  toEnvKey(name.replace(/(Config|Configuration|Credentials|Options|Settings)$/, "") || name);

const quote = (v: unknown) => {
  const s = typeof v === "string" ? v : JSON.stringify(v);
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
};

function flatten(obj: Record<string, unknown>, path: string[] = []): [string[], unknown][] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v)
      ? flatten(v as Record<string, unknown>, [...path, k])
      : [[[...path, k], v] as [string[], unknown]],
  );
}

const inputPath = resolve(input);
const source = await Bun.file(inputPath).text();

// find top-level `const name = {` / `const name: Type = {` declarations
const names = [
  ...source.matchAll(/^(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*\{/gm),
].map((m) => m[1]!);

if (names.length === 0) {
  console.error(`no object declarations found in ${input}`);
  process.exit(1);
}

// evaluate the file (so computed values resolve) by re-exporting the found objects
// from a temp copy placed next to the original, keeping relative imports working
const tmpPath = join(dirname(inputPath), `.env-gen-${Date.now()}-${basename(inputPath)}`);
await Bun.write(tmpPath, `${source}\nexport const __envGen__ = { ${names.join(", ")} };\n`);

let objects: Record<string, Record<string, unknown>>;
try {
  objects = (await import(tmpPath)).__envGen__;
} finally {
  await unlink(tmpPath).catch(() => {});
}

const blocks = Object.entries(objects).map(([name, obj]) => {
  const group = toGroup(name);
  const lines = flatten(obj).map(
    ([path, v]) => `${prefix}${group}_${path.map(toEnvKey).join("_")}=${quote(v)}`,
  );
  return [`# ${group}`, ...lines].join("\n");
});

console.log(`\n${blocks.join("\n\n")}`);
