#!/usr/bin/env node
import prompts from "prompts";
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import fg from "fast-glob";
import { v4 as uuidv4 } from "uuid";
import { paramCase, pascalCase, sentenceCase } from "change-case";
import whichPmRuns from "which-pm-runs";
import { spawn } from "child_process";
function run(cmd, args, cwd) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { cwd, stdio: "inherit", shell: process.platform === "win32" });
        child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} failed`))));
    });
}
function detectPM() {
    const pm = whichPmRuns()?.name;
    return pm === "pnpm" || pm === "yarn" ? pm : "npm";
}
function replaceTokens(text, tokens) {
    return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, k) => tokens[k] ?? `{{${k}}}`);
}
async function main() {
    // Node guard
    const major = parseInt(process.versions.node.split(".")[0], 10);
    if (major !== 22) {
        console.warn("⚠️ SPFx 1.21.1 is tested with Node 22.x. You are on " + process.version);
    }
    // Prompts
    const answers = await prompts([
        { type: "text", name: "solutionName", message: "Solution name", initial: "spfx-solution" },
        { type: "text", name: "componentName", message: "Web part name", initial: "HelloWorld" },
        { type: "text", name: "description", message: "Description", initial: "A great SPFx web part." },
        { type: "toggle", name: "install", message: "Install dependencies?", initial: true, active: "yes", inactive: "no" }
    ]);
    const solutionName = paramCase(answers.solutionName);
    const componentPascal = pascalCase(answers.componentName);
    const solutionTitle = sentenceCase(answers.solutionName);
    const tokens = {
        "SOLUTION_NAME": solutionName,
        "SOLUTION_TITLE": solutionTitle,
        "SOLUTION_ID": uuidv4().toUpperCase(),
        "FEATURE_ID": uuidv4().toUpperCase(),
        "COMPONENT_PASCAL": componentPascal,
        "COMPONENT_DESC": answers.description,
        "COMPONENT_ID": uuidv4().toUpperCase()
    };
    // Paths
    const templateDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..", "templates", "react-webpart");
    const targetDir = path.resolve(process.cwd(), solutionName);
    if (fs.existsSync(targetDir)) {
        console.error(`❌ Directory ${solutionName} already exists.`);
        process.exit(1);
    }
    // Copy template
    await fse.copy(templateDir, targetDir);
    // Rename tokenized dirs/files
    const entries = await fg(["**/*"], { cwd: targetDir, dot: true, onlyFiles: false });
    for (const rel of entries.sort((a, b) => b.length - a.length)) {
        const renamed = rel.replaceAll("{{COMPONENT_PASCAL}}", tokens["COMPONENT_PASCAL"]);
        if (renamed !== rel)
            await fse.move(path.join(targetDir, rel), path.join(targetDir, renamed));
    }
    // Replace tokens in file contents
    const textFiles = await fg(["**/*", "!node_modules/**"], { cwd: targetDir });
    for (const rel of textFiles) {
        const full = path.join(targetDir, rel);
        if (fs.statSync(full).isDirectory())
            continue;
        const txt = fs.readFileSync(full, "utf8");
        const replaced = replaceTokens(txt, tokens);
        if (replaced !== txt)
            fs.writeFileSync(full, replaced, "utf8");
    }
    // Install deps
    if (answers.install) {
        const pm = detectPM();
        console.log(`📦 Installing with ${pm}...`);
        try {
            if (pm === "pnpm")
                await run("pnpm", ["install"], targetDir);
            else if (pm === "yarn")
                await run("yarn", [], targetDir);
            else
                await run("npm", ["install"], targetDir);
        }
        catch {
            console.warn("⚠️ Install failed. Run it manually.");
        }
    }
    console.log(`✅ Done! cd ${solutionName} && gulp serve`);
}
main();
