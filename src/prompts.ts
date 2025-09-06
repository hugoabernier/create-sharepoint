// src/prompts.ts
import prompts, { PromptObject } from "prompts";
import { TemplateType, VARIANT_CHOICES, variantLabel } from "./templates.js";

export async function promptMissing(
  opts: { template?: TemplateType; variant?: string; name?: string; install?: boolean; skipInstall?: boolean },
  ctx: { isExisting: boolean }
) {
  const questions: PromptObject[] = [];

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
        const t = (opts.template ?? values.template) as TemplateType | undefined;
        if (!t) return null;
        if (t === "webpart" || t === "extension" || t === "adaptive-card-extension") return "select";
        return null;
      },
      name: "variant",
      message: (prev, values) => {
        const t = (opts.template ?? values.template) as TemplateType;
        if (t === "webpart") return "Which template would you like to use?";
        if (t === "extension") return "Which type of client-side extension would you like to create?";
        if (t === "adaptive-card-extension") return "Which template do you want to use?";
        return "Select a variant";
      },
      choices: (prev, values) => {
        const t = (opts.template ?? values.template) as TemplateType;
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
        const t = (opts.template ?? values.template) as TemplateType | undefined;
        const v = (opts.variant ?? values.variant) as string | undefined;
        if (t === "webpart") return "What is your web part name?";
        if (t === "library") return "What is your library name?";
        if (t === "adaptive-card-extension") return "What is your Adaptive Card Extension name?";
        if (t === "extension") {
          const label = variantLabel(v);
          return `What is your ${label} name?`;
        }
        return "Component/solution name (PascalCase recommended):";
      },
      initial: "HelloWorld",
      validate: (val: string) => (val?.trim() ? true : "Please enter a name")
    });
  }

  // 4) Install? (only when no flag was provided: install is undefined and skipInstall !== true)
  if (opts.skipInstall !== true && typeof opts.install === "undefined") {
    questions.push({
      type: "confirm",
      name: "install",
      message: "Install dependencies now?",
      initial: true // default = Yes
    });
  }

  // Run prompts (with graceful cancel)
  const answers = await prompts(questions, {
    onCancel: () => {
      // Exit nicely on Ctrl+C
      throw new Error("Aborted by user.");
    }
  });

  // Merge back (only set fields that were missing)
  if (answers.template !== undefined) opts.template = answers.template;
  if (answers.variant !== undefined) opts.variant = answers.variant;
  if (answers.name !== undefined) opts.name = answers.name;
  if (answers.install !== undefined) opts.install = answers.install;
}




