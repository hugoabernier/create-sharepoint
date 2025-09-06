// src/policies.ts
import path from "node:path";
const PROTECTED_RELATIVE = new Set([
    "package.json",
    "gulpfile.js",
    "tsconfig.json",
    "config/package-solution.json",
    "config/write-manifests.json",
    // add any other root-level files you never want auto-overwritten
]);
export function shouldCopyOnAdd(_absSrc, relFromVariantRoot) {
    // Normalize to posix-ish
    const rel = relFromVariantRoot.split(path.sep).join("/");
    // Block protected root files (exact matches)
    if (PROTECTED_RELATIVE.has(rel))
        return false;
    // Optionally skip entire directories in add-mode (e.g., ".vscode")
    if (rel.startsWith(".vscode/"))
        return false;
    // Otherwise allow
    return true;
}
