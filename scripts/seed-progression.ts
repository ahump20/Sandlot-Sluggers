import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sqlPath = resolve(process.cwd(), "schema/progression.sql");
const sql = readFileSync(sqlPath, "utf8");

console.log("Loaded schema ready for execution with Wrangler D1:");
console.log(sql);
console.log("Run `npm run cf:migrate` to apply it to the bound database.");
