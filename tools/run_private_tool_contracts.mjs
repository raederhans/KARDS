import { spawnSync } from "node:child_process";

const contractTest = "tools/kards_private_calibration_contract_test.py";
const candidates = process.platform === "win32"
  ? [["py", ["-3", contractTest]], ["python", [contractTest]]]
  : [["python3", [contractTest]], ["python", [contractTest]]];

for (const [command, args] of candidates) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error?.code === "ENOENT") {
    continue;
  }
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

console.error("Python 3 is required to run the private-tool contract tests.");
process.exit(1);
