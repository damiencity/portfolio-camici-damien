import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = "c:/Users/damie/Downloads/sequin-wave.html";
const outPath = path.join(__dirname, "..", "sequin-wave-shaders.js");

const h = fs.readFileSync(htmlPath, "utf8");

const vertStart = h.indexOf("var vertSrc = [");
const vertAfter = h.slice(vertStart + "var vertSrc = ".length);
const vertEnd = vertAfter.indexOf("].join('\\n')");
const vertArr = vertAfter.slice(0, vertEnd + 1);

const fragStart = h.indexOf("var fragSrc = [");
const fragAfter = h.slice(fragStart + "var fragSrc = ".length);
const fragEnd = fragAfter.indexOf("].join('\\n')");
const fragArr = fragAfter.slice(0, fragEnd + 1);

const out = `// Genere depuis sequin-wave.html
export const SEQUIN_VERT = ${vertArr}.join("\\n");

export const SEQUIN_FRAG = ${fragArr}.join("\\n");
`;

fs.writeFileSync(outPath, out);
console.log("Wrote", outPath);
