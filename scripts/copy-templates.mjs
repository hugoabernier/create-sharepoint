import { fileURLToPath } from "node:url";
import path from "node:path";
import fse from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const src = path.resolve(__dirname, "..", "templates");
const dest = path.resolve(__dirname, "..", "dist", "templates");

await fse.remove(dest);
await fse.copy(src, dest, { dereference: true });
console.log("Copied templates -> dist/templates");
