// src/remote-templates.ts
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
export async function resolveTemplatesBase(localDefault, templateUrl) {
    if (!templateUrl)
        return localDefault;
    if (templateUrl.startsWith("file:"))
        return templateUrl.replace(/^file:/, "");
    // Parse "https://github.com/org/repo#branch[:subdir]"
    const m = templateUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^#]+)#?(.+)?$/i);
    if (m) {
        const [, org, repo, hash] = m;
        const [branch, subdir] = (hash || "main").split(":");
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "spfx-tpl-"));
        await gitClone(`https://github.com/${org}/${repo}.git`, branch, tmp);
        return subdir ? path.join(tmp, subdir) : tmp;
    }
    // git+ssh
    if (templateUrl.startsWith("git+ssh://") || templateUrl.startsWith("git@")) {
        const [repo, hash] = templateUrl.split("#");
        const [branch, subdir] = (hash || "main").split(":");
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "spfx-tpl-"));
        await gitClone(repo.replace(/^git\+ssh:\/\//, ""), branch, tmp);
        return subdir ? path.join(tmp, subdir) : tmp;
    }
    // plain directory path
    if (fs.existsSync(templateUrl))
        return templateUrl;
    throw new Error(`Unsupported --template-url: ${templateUrl}`);
}
function gitClone(repo, branch, dest) {
    return new Promise((res, rej) => {
        const child = spawn("git", ["clone", "--depth", "1", "--branch", branch, repo, dest], { stdio: "ignore", shell: process.platform === "win32" });
        child.on("close", (code) => code === 0 ? res() : rej(new Error(`git clone failed (${code})`)));
    });
}
