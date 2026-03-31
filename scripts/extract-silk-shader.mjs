import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = "c:/Users/damie/Downloads/silk-cascade (2).html";
const outPath = path.join(__dirname, "..", "silk-cascade-shaders.js");

const h = fs.readFileSync(htmlPath, "utf8");
const start = h.indexOf("var fragSrc = [");
if (start < 0) throw new Error("fragSrc not found");
const after = h.slice(start + "var fragSrc = ".length);
const end = after.indexOf("].join('\\n')");
if (end < 0) throw new Error("join not found");
const arr = after.slice(0, end + 1);

const vert = "attribute vec2 a_pos; void main(){gl_Position=vec4(a_pos,0,1);}";

const out = `// Généré depuis silk-cascade (2).html — ne pas éditer à la main (regénérer avec node scripts/extract-silk-shader.mjs)
export const SILK_VERT = ${JSON.stringify(vert)};

export const SILK_FRAG = ${arr}.join("\\n");
`;

fs.writeFileSync(outPath, out);
console.log("Wrote", outPath);
