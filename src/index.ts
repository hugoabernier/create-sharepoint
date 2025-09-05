#!/usr/bin/env node
import prompts from "prompts";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import fg from "fast-glob";
import { v4 as uuidv4 } from "uuid";
import whichPmRuns from "which-pm-runs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { paramCase } from "change-case";
import { pascalCase } from "change-case";
import { sentenceCase } from "change-case";


// -------- path helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- helpers: place near top-level utilities ---
function isDirEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  const entries = fs.readdirSync(dir).filter(n => n !== ".git" && n !== ".gitkeep");
  return entries.length === 0;
}


function getTemplateDir(answers: Record<string, any>): string {

    let templateSubdir = "webpart";
    switch (answers.componentType) {
        case "extension":
            templateSubdir = "extension";
            break;
        case "library":
            templateSubdir = "library";
            break;
        case "ace":
            templateSubdir = "adaptive-card-extension";
            break;
    }

    let templateVariant = answers.template || "react";

    const a = path.join(__dirname, "..", "templates", templateSubdir, templateVariant);
    const b = path.join(__dirname, "templates", templateSubdir, templateVariant);
    const c = path.join(__dirname, "..", "..", "templates", templateSubdir, templateVariant);
    if (fs.existsSync(a)) return a;
    if (fs.existsSync(b)) return b;
    if (fs.existsSync(c)) return c;
    throw new Error(`Templates not found.\nTried:\n  ${a}\n  ${b}\n  ${c}`);
}

// -------- token helpers
// tiny helper (avoids String.replaceAll typing shenanigans)
const rep = (s: string, a: string, b: string) => s.split(a).join(b);

// Templating for PATHS (supports {{TOKEN}} and {{token}} for convenience)
function renderPath(relPath: string, tokens: Record<string, string>) {
    let out = relPath;
    for (const [K, v] of Object.entries(tokens)) {
        out = rep(out, `{{${K}}}`, v);
        out = rep(out, `{{${K.toLowerCase()}}}`, v);
    }
    return out;
}

// Templating for CONTENT (case-insensitive tokens)
function renderContent(text: string, tokens: Record<string, string>) {
    return text.replace(/\{\{([A-Za-z0-9_]+)\}\}/g, (_, raw) => {
        const key = String(raw).toUpperCase();
        return tokens[key] ?? `{{${raw}}}`;
    });
}

/**
 * Renders the template directory into the target directory.
 * - Computes FINAL destination path per file (no in-place renames)
 * - Replaces tokens in file contents
 * - Copies binary files as-is (no tokenization)
 */
async function renderTemplateDir(templateDir: string, targetDir: string, tokens: Record<string, string>) {
    const patterns = ["**/*", "!**/node_modules/**"];
    const entries = await fg(patterns, { cwd: templateDir, dot: true, onlyFiles: false });

    for (const rel of entries) {
        const src = path.join(templateDir, rel);
        const stat = fs.statSync(src);

        // Compute final path up front (this is the key difference!)
        const destRel = renderPath(rel, tokens);
        const dest = path.join(targetDir, destRel);

        if (stat.isDirectory()) {
            await fse.ensureDir(dest);
            continue;
        }

        // Decide if we treat as text or binary by extension
        const isBinary =
            /\.(png|jpe?g|gif|bmp|ico|webp|woff2?|ttf|eot|pdf)$/i.test(rel);

        await fse.ensureDir(path.dirname(dest));

        if (isBinary) {
            await fse.copy(src, dest);
        } else {
            const txt = fs.readFileSync(src, "utf8");
            const rendered = renderContent(txt, tokens);
            fs.writeFileSync(dest, rendered, "utf8");
        }
    }
}

// -------- utils

function run(cmd: string, args: string[], cwd?: string) {
    return new Promise<void>((resolve, reject) => {
        const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} failed (${code})`))));
    });
}

function detectPM(): "pnpm" | "yarn" | "npm" {
    const pm = whichPmRuns()?.name;
    return pm === "pnpm" || pm === "yarn" ? pm : "npm";
}



function pascalToCamel(str: string): string {
    return str.charAt(0).toLowerCase() + str.slice(1);
}




function printSplash() {
  if (!process.stdout.isTTY) return; // skip in non-interactive CI
  const art = String.raw`
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@#+##@@@@@@@@@%**@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@#=-=@@@@@@@@@*=-+@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@%+=%@@@@@@@@#*+=@@@@@@@@@@#**@@@@@@@@@@@@
@@@@@@@@@@@+=%@@@@@%%%%**@@@@@@@@@@+=#@@@@@@@@@@@@
@@@@@@@@@@@%+-**+*%%%%@%%##%%@@@@#*#%@@@@@@@@@@@@@
@@@@@@@@@@@@%*=-=*@@@%%%@%%@*==*+=#@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@%%%%@@@@%*+#@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@%%%%@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@%##@@@@@@@@@@@@%%%###%@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@%%@@@@@%###**********@@@@@
@@@@@@@@@@@@@@@@@@@@%%%%%%@@#+-::+**********#@@@@@
@@@@@@@@@@@@@@@@@@@@%%%@@@*-:....-**********%@@@@@
@@@@@@@@@@@@@@@@@@@@@%%@@#-.......:+********@@@@@@
@@@@@@@@@@@@@@@@@@@@@%#@+:...:::...:-+*****#@@@@@@
@@@@@@@@@@@@@@@@@@@@@%#=::::+*#**=...:-=++*@@@@@@@
@@@@@@@@@@@@@@@@@@@%%%*::::+##*###-::::::-#@@@@@@@
@@@@@@@@@@@@@%%###*+@%=::::=*####*::::::-#@@@@@@@@
@@@@@@@@@@%#*****+=%@#-:::::-=++=::::::-#@@@@@@@@@
@@@@@@@@#*******+-+@@+=+=-:::::::::::-=%@@@@@@@@@@
@@@@@@@@@@%%#**+=-*@%*###*----------=#@@@@@@@@@@@@
@@@@@@@@@@@@@@%=--#@#+*##*--------=#@@@@@@@@@@@@@@
@@@@@@@@@@@@@@%=--%@*--==-------+#@@@@@@@@@@@@@@@@
@@@@@@@@@@@@%#*=--*%+--------=+%@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@#***+=-=**-----=++*#@@@@@@@@@@@@@@@@@@@
@@@@@@@@@*==*****++=+++++*****#@@@@@@@@@@@@@@@@@@@
@@@@@@@#--+********%@@@@#*****%@@@@@@@@@@@@@@@@@@@
@@@@@@#:-++++*++#%%@@@@@@****#@@@@@@@@@@@@@@@@@@@@
@@@@@@-:===+===#@@@@@@@@@#**%@@@@@@@@@@@@@@@@@@@@@
@@@@@*::----+#@@@@@@@@@@@@%@@@@@@@@@@@@@@@@@@@@@@@
@@@@@+-=+*#%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@`;
  // Optional clear screen (comment out if you prefer no clear):
  process.stdout.write("\x1Bc");
  console.log(art);
  console.log("\nWelcome to the Microsoft 365 SPFx Generator@1.21.1");
  console.log("──────────────────────────────────────────────────\n");
}



// -------- main

async function main() {
    const noSplash = process.argv.includes("--no-splash");
    if (!noSplash) printSplash();

    // Optional guard: SPFx 1.21.x is fine on Node 22, warn if not
    const major = parseInt(process.versions.node.split(".")[0], 10);
    if (major !== 22) {
        console.warn(`SPFx 1.21.x expects Node 22 LTS; you're on ${process.version}.`);
    }

    // Parse first positional arg as the folder name (ignore flags)
    const argName = process.argv.slice(2).find(a => !a.startsWith("-"));

    // Compute a safe default from cwd
    const cwdBase = path.basename(process.cwd());
    const safeDefault = cwdBase.replace(/[^a-zA-Z0-9-_]/g, "") || "my-spfx-solution";

    // TODO: Default the solution name to the current folder name?
    const cwdName = path.basename(process.cwd());
    const answers = await prompts([
        {   type: "text", 
            name: "solutionName", 
            message: "What is your solution name?", 
            initial: safeDefault, 
            validate: v => /^[a-zA-Z0-9-_]+$/.test(v) ? true : "Alphanumerics, dash, underscore only." 
        },
        {
            type: "select",
            name: "componentType",
            message: "Which type of client-side component do you wish to create?",
            choices: [
                { title: "WebPart", value: "webpart" },
                { title: "Extension", value: "extension" },
                { title: "Library", value: "library" },
                { title: "Adaptive Card Extension", value: "ace" }
            ],
            initial: 0
        },
        {
            // only ask this if componentType === "webpart"
            type: prev => (prev === "webpart" ? "select" : null),
            name: "template",
            message: "Which template would you like to use?",
            choices: [
                { title: "Minimal", value: "minimal" },
                { title: "No framework", value: "no-framework" },
                { title: "React", value: "react" }
            ],
            initial: 0
        },
        {
            // only ask this if componentType === "extension"
            type: prev => (prev === "extension" ? "select" : null),
            name: "template",
            message: "Which type of client-side extension would you like to create?",
            choices: [
                { title: "Application Customizer", value: "app-customizer" },
                { title: "Field Customizer", value: "field-customizer" },
                { title: "ListView Command Set", value: "listview-command-set" },
                { title: "Form Customizer", value: "form-customizer" },
                { title: "Search Query Modifier", value: "search-query-modifier" },
            ],
            initial: 0
        },
        {
            // only ask this if componentType === "ace"
            type: prev => (prev === "ace" ? "select" : null),
            name: "template",
            message: "Which template do you want to use?",
            choices: [
                { title: "Generic Card Template", value: "generic-card" },
                { title: "Search Card Template", value: "search-card" },
                { title: "Data Visualization Template", value: "data-visualization" },
            ],
            initial: 0
        },
        { type: "text", name: "componentName", message: "What is your Web part name?", initial: "HelloWorld", validate: v => /^[A-Za-z]\w*$/.test(v) ? true : "Start with a letter; alphanumerics/underscore only." },
        { type: "toggle", name: "install", message: "Install dependencies?", initial: true, active: "yes", inactive: "no" }
    ], { onCancel: () => process.exit(1) });

    const solutionName = paramCase(answers.solutionName);
    const componentPascal = pascalCase(answers.componentName);
    const solutionTitle = sentenceCase(answers.solutionName);

    const tokens = {
        SOLUTION_NAME: solutionName,
        SOLUTION_TITLE: solutionTitle,
        SOLUTION_ID: uuidv4().toUpperCase(),
        FEATURE_ID: uuidv4().toUpperCase(),
        COMPONENT_PASCAL: componentPascal,
        COMPONENT_ID: uuidv4().toUpperCase(),
        COMPONENT_CAMEL: pascalToCamel(componentPascal)
    };

    const templateDir = getTemplateDir(answers);
    
    const targetDir = path.resolve(process.cwd(), solutionName === "." ? "" : solutionName);


    if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
        console.error(`Target directory "${solutionName}" is not empty.`);
        process.exit(1);
    }

    console.log(`\nCreating ${solutionName} in ${targetDir}...\n`);

    await renderTemplateDir(templateDir, targetDir, tokens);

    if (answers.install) {
        const pm = detectPM();
        console.log(`\nInstalling dependencies with ${pm}...\n`);
        try {
            if (pm === "pnpm") await run("pnpm", ["install"], targetDir);
            else if (pm === "yarn") await run("yarn", [], targetDir);
            else await run("npm", ["install"], targetDir);
        } catch {
            console.warn("Install failed. Run it manually later.");
        }
    }

    console.log(`\nCongratulations!\nSolution ${solutionName} is created.\nNext steps:\n  cd ${solutionName}\n  gulp serve\n`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
