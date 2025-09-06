// src/add-component.ts
import { copyDirWithTransforms } from "./copy.js";
import { resolveComponentTemplate } from "./resolve.js";
import { toPascalCase, toCamelCase, newUpperGuid } from "./token-utils.js";
import { shouldCopyOnAdd } from "./policies.js";
export async function addComponent(args) {
    const tokens = {
        COMPONENT_PASCAL: toPascalCase(args.name),
        COMPONENT_CAMEL: toCamelCase(args.name),
        COMPONENT_ID: newUpperGuid()
        // Optionally merge in SOLUTION_* by reading config/package-solution.json
    };
    await copyDirWithTransforms(resolveComponentTemplate(args.template, args.variant), args.targetDir, tokens, { mode: "add", shouldCopy: shouldCopyOnAdd });
    // If you need to *append* to package-solution features or other JSON,
    // do it programmatically here (read/modify/write), rather than raw overwrite.
}
