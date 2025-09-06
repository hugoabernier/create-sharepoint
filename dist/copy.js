import path from "node:path";
import fse from "fs-extra";
export async function copyDirWithTransforms(srcDir, destDir, tokens, opts) {
    await fse.ensureDir(destDir);
    const entries = await fse.readdir(srcDir, { withFileTypes: true });
    for (const e of entries) {
        const relIn = e.name; // relative to srcDir
        const absIn = path.join(srcDir, relIn);
        // rename path segment by tokens (filenames & folders)
        let relOutName = applyTokens(relIn, tokens);
        relOutName = renameDotfiles(relOutName);
        relOutName = stripTemplateSuffix(relOutName);
        const absOut = path.join(destDir, relOutName);
        const relOut = path.relative(destDir, absOut); // mostly for logging
        const relFromVariantRoot = path.relative(srcDir, absIn); // for policy
        // Policy: allow caller to skip certain paths (esp. in "add" mode)
        if (opts?.shouldCopy && !opts.shouldCopy(absIn, relFromVariantRoot)) {
            continue;
        }
        if (e.isDirectory()) {
            await copyDirWithTransforms(absIn, absOut, tokens, opts);
        }
        else {
            const isText = shouldTemplatize(relIn);
            if (isText) {
                const s = await fse.readFile(absIn, "utf8");
                const out = applyTokens(s, tokens);
                await fse.ensureDir(path.dirname(absOut));
                await fse.writeFile(absOut, out, "utf8");
            }
            else {
                await fse.ensureDir(path.dirname(absOut));
                await fse.copy(absIn, absOut, { overwrite: true, errorOnExist: false });
            }
        }
    }
}
function shouldTemplatize(filename) {
    return filename.endsWith(".tmpl") || /\.(json|js|ts|tsx|md|html|scss|css)$/i.test(filename);
}
function stripTemplateSuffix(name) {
    return name.endsWith(".tmpl") ? name.slice(0, -5) : name;
}
function renameDotfiles(name) {
    return name.startsWith("dot-") ? "." + name.slice(4) : name;
}
function applyTokens(input, tokens) {
    return input.replace(/\{\{(\w+)\}\}/g, (_, k) => tokens[k] ?? "");
}
