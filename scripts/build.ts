import esbuild from "esbuild";

const built = await esbuild.build({
  treeShaking: true,
  bundle: true,
  splitting: false,
  minify: true,
  entryPoints: ["./src/index.ts"],
  outdir: "dist",
  target: "es2022",
  format: "esm",
  platform: "browser",
  conditions: ["workerd", "worker", "browser"],
  alias: {
    "viem/*": "./node_modules/viem/_esm/*",
    "@ensdomains/ensjs/*": "./node_modules/@ensdomains/ensjs/dist/esm/*",
    stream: "./src/utils/stub.ts",
    request: "./src/utils/stub.ts",
    buffer: "./src/utils/stub.ts",
  },
  metafile: true,
});

Bun.write("./dist/meta.json", JSON.stringify(built.metafile, null, 2));

console.log("Build complete!");
