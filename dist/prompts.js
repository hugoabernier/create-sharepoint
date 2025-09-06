// src/prompts.ts
import prompts from "prompts";
import { VARIANT_CHOICES, variantLabel } from "./templates.js";
export async function promptMissing(opts, ctx) {
    const questions = [];
    // 1) Template
    if (!opts.template) {
        questions.push({
            type: "select",
            name: "template",
            message: ctx.isExisting ? "What type of component do you want to add?" : "What type of solution do you want to create?",
            choices: [
                { title: "Web part", value: "webpart" },
                { title: "Library", value: "library" },
                { title: "Extension", value: "extension" },
                { title: "Adaptive Card Extension", value: "adaptive-card-extension" }
            ],
            initial: 0
        });
    }
    // 2) Variant (only for certain templates)
    if (!opts.variant) {
        questions.push({
            type: (prev, values) => {
                const t = (opts.template ?? values.template);
                if (!t)
                    return null;
                if (t === "webpart" || t === "extension" || t === "adaptive-card-extension")
                    return "select";
                return null;
            },
            name: "variant",
            message: (prev, values) => {
                const t = (opts.template ?? values.template);
                if (t === "webpart")
                    return "Which template type would you like to use?";
                if (t === "extension")
                    return "Which type of client-side extension would you like to create?";
                if (t === "adaptive-card-extension")
                    return "Which template do you want to use?";
                return "Select a variant";
            },
            choices: (prev, values) => {
                const t = (opts.template ?? values.template);
                return VARIANT_CHOICES[t] ?? [];
            },
            initial: 0
        });
    }
    // 3) Name
    if (!opts.name) {
        questions.push({
            type: "text",
            name: "name",
            message: (prev, values) => {
                const t = (opts.template ?? values.template);
                const v = (opts.variant ?? values.variant);
                if (t === "webpart")
                    return "What is your web part name?";
                if (t === "library")
                    return "What is your library name?";
                if (t === "adaptive-card-extension")
                    return "What is your Adaptive Card Extension name?";
                if (t === "extension") {
                    const label = variantLabel(v);
                    return `What is your ${label} name?`;
                }
                return "Component/solution name (PascalCase recommended):";
            },
            initial: "HelloWorld",
            validate: (val) => (val?.trim() ? true : "Please enter a name")
        });
    }
    // 4) Install? (only when no flag was provided: install is undefined and skipInstall !== true)
    if (opts.skipInstall !== true && typeof opts.install === "undefined") {
        questions.push({
            type: "confirm",
            name: "install",
            message: "Install dependencies?",
            initial: true, // default = Yes,
            active: "yes",
            inactive: "no"
        });
    }
    // Run prompts (with graceful cancel)
    const answers = await prompts(questions, {
        onCancel: () => {
            // Exit nicely on Ctrl+C
            throw new Error("Cancelled");
        }
    });
    // Merge back (only set fields that were missing)
    if (answers.template !== undefined)
        opts.template = answers.template;
    if (answers.variant !== undefined)
        opts.variant = answers.variant;
    if (answers.name !== undefined)
        opts.name = answers.name;
    if (answers.install !== undefined)
        opts.install = answers.install;
}
export async function promptFromRemoteTemplate(opts, ctx) {
    // For now, this is simulated
    const response = await prompts([
        {
            type: "select",
            name: "template",
            message: "Select a Takeda corporate web part template:",
            choices: [
                { title: "News Carousel", value: "news-carousel" },
                { title: "Events Calendar", value: "events-calendar" },
                { title: "Employee Directory", value: "employee-directory" },
                { title: "Custom Links", value: "custom-links" },
                { title: "KPI Dashboard", value: "kpi-dashboard" }
            ],
            initial: 0
        }
    ]);
    return response.template;
}
