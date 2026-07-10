import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDirectory = path.resolve("dist");
const indexPath = path.join(distDirectory, "index.html");
const serverDirectory = path.join(distDirectory, "server");
const workerPath = path.join(serverDirectory, "index.js");

await access(indexPath);
await mkdir(serverDirectory, { recursive: true });
await writeFile(workerPath, `const worker = {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};

export default worker;
`, "utf8");

console.log("Sites static worker prepared in dist/server/index.js.");
