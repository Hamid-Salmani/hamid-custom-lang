import { run } from "./language";
import * as fs from "fs";

if (process.argv.length < 3) {
  console.log("Usage: npx tsx run.ts program.sl");
  process.exit(1);
}

const filename = process.argv[2];

try {
  const code = fs.readFileSync(filename, "utf-8");
  const output = run(code);

  if (output) {
    console.log(output);
  } else {
    console.log("Program executed successfully (no output)");
  }
} catch (error: any) {
  console.log("Error:", error.message);
}
