// src/scaffold-solution.ts
import { copyDirWithTransforms } from "./copy.js";
import { resolveSolutionTemplate, resolveComponentTemplate } from "./resolve.js";
import { toPascalCase, toCamelCase, toTitleCase, newUpperGuid } from "./token-utils.js";
export async function scaffoldNewSolution(args) {
    const tokens = {
        SOLUTION_NAME: args.name,
        SOLUTION_TITLE: toTitleCase(args.name),
        SOLUTION_ID: newUpperGuid(),
        FEATURE_ID: newUpperGuid(),
        COMPONENT_PASCAL: toPascalCase(args.name),
        COMPONENT_CAMEL: toCamelCase(args.name),
        COMPONENT_ID: newUpperGuid(),
        NODE_VERSION: process.versions.node.split(".")[0]
    };
    // 1) base skeleton
    await copyDirWithTransforms(resolveSolutionTemplate(), args.targetDir, tokens, { mode: "create" });
    // 2) variant overlay onto solution root
    await copyDirWithTransforms(resolveComponentTemplate(args.template, args.variant), args.targetDir, tokens, { mode: "create" });
}
