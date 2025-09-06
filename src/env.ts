import semver from "semver";
import fs from "fs";
import path from "path";

export async function checkNodeForSpfx(opts: { allowWarn: boolean }) {
    const required = "22.0.0";
    const cur = process.versions.node;
    console.log(`Node.js version ${cur} detected.`);
    if (semver.lt(semver.coerce(cur)!, required)) {
        const msg = `SPFx 1.21.1 requires Node >= ${required}. You are on ${cur}. You can scaffold now, but you must use Node >= ${required} to build/run.`;
        if (opts.allowWarn) console.warn(`\n⚠ ${msg}`);
        else throw new Error(msg);
    }
}

export async function ensureGulpInTemplate(targetDir: string) {
    // Ensure generated package.json includes gulp + gulp-cli in devDependencies
    const pkgPath = path.join(targetDir, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.devDependencies ||= {};
    pkg.devDependencies["gulp"] ||= "^4.0.2";
    pkg.devDependencies["gulp-cli"] ||= "^2.3.0";
    // Provide convenience scripts mapping gulp tasks -> npm scripts (cross-PM)
    pkg.scripts ||= {};
    pkg.scripts["build"] ||= "gulp bundle";
    pkg.scripts["serve"] ||= "gulp serve";
    pkg.scripts["package"] ||= "gulp package-solution";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}
