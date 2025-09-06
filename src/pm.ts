// src/pm.ts
import { spawn } from "node:child_process";

export type PM = "npm" | "pnpm" | "yarn";

export function detectPM(): PM {
    const ua = process.env.npm_config_user_agent ?? "";
    if (ua.includes("pnpm")) return "pnpm";
    if (ua.includes("yarn")) return "yarn";
    return "npm";
}

export function installDeps({ cwd, pm }: { cwd: string; pm: PM }): Promise<void> {
    const cmd = pm;
    // explicit “install” is fine across npm/pnpm/yarn classic; avoids ambiguity.
    const args = ["install"];
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, {
            cwd,
            stdio: "inherit",
            shell: process.platform === "win32"
        });
        child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${cmd} ${args.join(" ")} failed with code ${code}`));
        });
    });
}
