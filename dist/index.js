#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";
import { bold, cyan, green, red, yellow } from "kolorist";
import { checkNodeForSpfx, ensureGulpInTemplate } from "./env.js";
import { detectPM, installDeps } from "./pm.js";
import { promptMissing, promptFromRemoteTemplate } from "./prompts.js";
import { showSplash } from "./splash.js";
import { scaffoldNewSolution } from "./scaffold-solution.js";
import { addComponent } from "./add-component.js";
async function main() {
    const argv = minimist(process.argv.slice(2), {
        string: ["template", "variant", "name", "pm", "template-url",],
        boolean: ["skip-install", "no-install", "force"],
        alias: {
            t: "template",
            v: "variant",
            n: "name",
            i: "install",
            f: "force",
            "skip-install": "no-install" // treat both as the same
        },
        default: {}
    });
    const positionalTarget = argv._[0];
    const targetDir = path.resolve(process.cwd(), positionalTarget ?? ".");
    const hasInstall = Object.prototype.hasOwnProperty.call(argv, "install");
    const hasSplash = Object.prototype.hasOwnProperty.call(argv, "splash");
    const install = hasInstall
        // If provided, coerce "false"/"0" to false; everything else true (bare --install => true)
        ? (typeof argv.install === "string"
            ? !/^(false|0)$/i.test(argv.install)
            : Boolean(argv.install))
        : undefined;
    const splash = hasSplash
        // If provided, coerce "false"/"0" to false; everything else true (bare --splash => true)
        ? (typeof argv["splash"] === "string"
            ? !/^(false|0)$/i.test(argv["splash"])
            : Boolean(argv["splash"]))
        : true; // default true
    const skipInstall = argv["skip-install"] === true || argv["no-install"] === true;
    const templateUrl = argv["template-url"];
    const opts = {
        template: argv.template,
        variant: argv.variant,
        name: argv.name,
        pm: argv.pm,
        install,
        skipInstall,
        force: argv.force ?? false,
        templateUrl
    };
    const isExisting = await isExistingSolution(targetDir);
    if (splash !== false) {
        showSplash("Welcome to the SPFx generator", "v1.21.1");
    }
    if (!isExisting) {
        await checkNodeForSpfx({ allowWarn: true });
    }
    if (opts.templateUrl) {
        console.log(yellow(`Using custom template URL: ${bold(opts.templateUrl)}\n`));
        await promptFromRemoteTemplate(opts, { isExisting });
    }
    else {
        await promptMissing(opts, { isExisting });
    }
    const pm = opts.pm ?? detectPM();
    if (!isExisting) {
        await scaffoldNewSolution({
            targetDir,
            template: opts.template,
            variant: opts.variant,
            name: opts.name,
            pm
        });
        await ensureGulpInTemplate(targetDir);
        // decide install after prompts + flags
        const shouldInstall = computeShouldInstall(opts);
        if (shouldInstall) {
            console.log(yellow("\nInstalling project dependencies..."));
            await installDeps({ cwd: targetDir, pm });
        }
        console.log(green("\n✔ All set!"));
        console.log(`\nNext steps:`);
        const cdPath = path.relative(process.cwd(), targetDir) || ".";
        if (cdPath !== ".") {
            console.log(`${bold(cyan(`  cd ${cdPath}`))}`);
        }
        if (!shouldInstall) {
            console.log(`${bold(cyan(`  ${pm} install`))}`);
        }
        console.log(`${bold(cyan(`  gulp serve`))}\n`);
    }
    else {
        await addComponent({
            targetDir,
            template: opts.template,
            variant: opts.variant,
            name: opts.name
        });
        const shouldInstall = computeShouldInstall(opts);
        if (shouldInstall) {
            console.log(yellow("\nInstalling updated dependencies..."));
            await installDeps({ cwd: targetDir, pm });
        }
        console.log(green("\n✔ Component added."));
        console.log(`\nTry:\n  ${bold(cyan(`gulp serve`))}\n`);
    }
}
function computeShouldInstall(opts) {
    if (opts.skipInstall)
        return false; // explicit skip
    if (typeof opts.install === "boolean")
        return opts.install; // explicit force OR prompt answer
    return true; // fallback (shouldn’t happen because prompt sets it), keep default-to-yes
}
async function isExistingSolution(dir) {
    const pkgJsonPath = path.join(dir, "package.json");
    if (!fs.existsSync(pkgJsonPath))
        return false;
    try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
        const hasSpfx = (pkg.dependencies && Object.keys(pkg.dependencies).some(k => k.startsWith("@microsoft/sp-"))) ||
            (pkg.devDependencies && Object.keys(pkg.devDependencies).some(k => k.startsWith("@microsoft/sp-")));
        const hasConfig = fs.existsSync(path.join(dir, "config", "package-solution.json"));
        const hasGulp = fs.existsSync(path.join(dir, "gulpfile.js"));
        return hasSpfx && hasConfig && hasGulp;
    }
    catch {
        return false;
    }
}
main().catch((e) => {
    console.error(red(`\n✖ ${e?.message ?? e}`));
    process.exit(1);
});
