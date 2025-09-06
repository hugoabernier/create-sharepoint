import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export function templatesRoot() { return path.resolve(__dirname, "../templates"); }
export function resolveSolutionTemplate() { return path.join(templatesRoot(), "solution"); }
export function resolveComponentTemplate(template, variant) {
    return path.join(templatesRoot(), template, variant); // solution-rooted variant
}
const mountPoints = {
    "webpart": "src/webparts",
    "extension": "src/extensions",
    "adaptive-card-extension": "src/adaptiveCardExtensions",
    "library": "src/libraries"
};
export function resolveComponentSourceBase(templateRoot, template) {
    const mp = mountPoints[template];
    const probe = path.join(templateRoot, mp);
    return fs.existsSync(probe) ? probe : templateRoot; // solution-rooted vs component-rooted
}
export function resolveComponentDest(solutionDir, template) {
    const mp = mountPoints[template] ?? "src";
    return path.join(solutionDir, mp);
}
/** Optional folder inside a variant that should be merged into the solution root (e.g., teams/) */
export function resolveRootOverlay(templateRoot) {
    const overlay = path.join(templateRoot, "root-overlay");
    return fs.existsSync(overlay) ? overlay : null;
}
