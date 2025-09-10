# `@hugoabernier/create-sharepoint`

A modern, batteries-included scaffolder for **SharePoint Framework (SPFx)** projects and components. It can:

- **Create a new SPFx solution** (web part, extension, library, ACE).
- **Add a new component** to an existing SPFx solution (safely avoids overwriting protected files).
- Detect your package manager, wire up **gulp** scripts, and (optionally) install dependencies.

> It is a prototype for an open-source SPFx scaffolder, inspired by [Create React App](https://create-react-app.dev/) and [Create Next App](https://nextjs.org/docs/api-reference/create-next-app).
---

## Quick start

### Using **npm create**

```bash
# New solution in "hello-spfx"
npm create @hugoabernier/sharepointlatest hello-spfx

# Or prompt in current directory
npm create @hugoabernier/sharepoint@latest
```

### Using **npx**

```bash
# By command name (published bin)
npx create-sharepoint@latest hello-spfx

# Or by package name
npx @hugoabernier/create-sharepoint@latest hello-spfx
```

### Using **pnpm**

```bash
pnpm create @hugoabernier/sharepoint@latest hello-spfx
```

### Using **yarn**

```bash
yarn create @hugoabernier/sharepoint@latest hello-spfx
```

> Tip: always append **`@latest`** to bypass old caches.

---

## What it generates

- A ready-to-build SPFx solution with convenience scripts:
  - `npm run serve` → `gulp serve`
  - `npm run build` → `gulp bundle`
  - `npm run package` → `gulp package-solution`
- Template-driven files (tokens like `{{SOLUTION_NAME}}`, `{{COMPONENT_PASCAL}}`, etc. are filled)
- **`.nvmrc`** populated with your major Node version via `{{NODE_VERSION}}`
- **Dotfiles**: any file named `dot-…` in templates is emitted as `.…` (e.g., `dot-gitignore` → `.gitignore`)

---

## Modes (auto-detected)

- **New Solution Mode**: runs when not inside an SPFx solution
- **Add Component Mode**: runs when inside an SPFx solution (detected via `package.json`, `config/package-solution.json`, and `gulpfile.js`).  
  Protected root files (e.g., `package.json`, `gulpfile.js`, `tsconfig.json`, `config/package-solution.json`) are **not** overwritten.

⚡ **Important**: If you run the CLI in a non-empty folder containing an SPFx solution, it will **offer to add a component instead of creating a new solution**.

---

## Templates & Variants

**Templates** (`--template`):
- `webpart`
- `library`
- `extension`
- `adaptive-card-extension` (ACE)

**Variants** (`--variant`):
- **webpart**: `minimal`, `no-framework`, `react`
- **library**: `minimal`
- **extension**:
  - `application-customizer`
  - `field-customizer`
  - `listview-command-set`
  - `form-customizer`
  - `search-query-modifier`
- **adaptive-card-extension**:
  - `basic-card`, `primary-text-card`, `image-card`, `search-card`, `data-visualization-card`

If you omit values, the CLI will prompt you interactively.

---

## CLI usage

```bash
create-sharepoint [targetDir] [options]
# or
npx @hugoabernier/create-sharepoint [targetDir] [options]
# or
npm|pnpm|yarn create @hugoabernier/sharepoint [targetDir] [options]
```

### Positional

- **`[targetDir]`**: Directory to generate into. Defaults to `.` (current directory).

### Options & Flags

| Flag | Alias | Type | Values | Default | Applies To | Description |
|---|---|---|---|---|---|---|
| `--template` | `-t` | string | see list above | *(prompted)* | new/add | Which template to use. |
| `--variant` | `-v` | string | per template | *(prompted)* | new/add | Which variant of the template. |
| `--name` | `-n` | string | any | *(prompted)* | new/add | Component / solution name (used for class/file names & titles). |
| `--pm` |  | string | `npm` \| `pnpm` \| `yarn` | auto-detect | new/add | Force a package manager. |
| `--install` | `-i` | boolean | `true`/`false` | *(prompted)* | new/add | Whether to run package install after scaffolding. `--install` (no value) means **true**. |
| `--no-install` |  | boolean |  |  | new/add | Skip installing dependencies. Alias: `--skip-install`. |
| `--skip-install` |  | boolean |  |  | new/add | Same as `--no-install`. |
| `--force` | `-f` | boolean |  | `false` | new/add | Proceed even if target contains files (use carefully). |
| `--template-url` |  | string (URL) | e.g., `https://…/my-template.zip` |  | new/add | Use a remote template source (advanced). |
| `--splash` |  | boolean | `true`/`false` | `true` | new/add | Show/hide the startup splash. Accepts `--splash=false`. |

> Booleans accept `true/false` or `1/0`. Bare `--flag` is treated as **true**.

### Examples

Create a **React web part** using **pnpm**, auto-install:

```bash
pnpm create @hugoabernier/sharepoint@latest my-webpart \
  --template webpart --variant react --name "HelloWorld" --pm pnpm --install
```

Create an **Application Customizer** in current directory and **skip install**:

```bash
npm create @hugoabernier/sharepoint@latest \
  --template extension --variant application-customizer --name "TopNav" --no-install
```

**Add** a new **Field Customizer** component to an existing solution:

```bash
# Run inside the solution root
npx create-sharepoint@latest \
  --template extension --variant field-customizer --name "PriceFormatter"
```

Scaffold from a **remote template**:

```bash
yarn create @hugoabernier/sharepoint@latest my-solution \
  --template webpart --variant minimal --name "Contoso" \
  --template-url https://example.com/spfx-templates/webpart-minimal.zip
```

Hide the splash (quiet start):

```bash
npx @hugoabernier/create-sharepoint@latest my-solution --splash=false
```

---

## After generation

From your solution directory:

```bash
# install (if you skipped)
npm install   # or pnpm install / yarn install

# local workbench/serve
npm run serve

# bundle
npm run build

# package the solution (.sppkg)
npm run package
```

---

## Requirements & environment

- **Node.js ≥ 22.0.0** is required by SPFx 1.21.1 for build/run. If you scaffold on an older Node, you’ll get a warning.  
- Windows-friendly: child processes are spawned with `shell` on Windows.  
- Package manager detection is automatic (falls back to npm) but you can force via `--pm`.

---

## How “Add Component” protects you

When adding a component to an existing solution, certain root files are never overwritten (e.g., `package.json`, `gulpfile.js`, `tsconfig.json`, `config/package-solution.json`). Project policies also skip unwanted folders (like `.vscode`) in add mode. You keep your customizations; you get the new component.

---

## Tokens available to templates

During scaffolding, the following tokens are substituted inside template files (e.g., `.json`, `.ts`, `.tsx`, `.md`, `.scss`, `.html`, and `*.tmpl` files):

- **Solution tokens**:  
  `{{SOLUTION_NAME}}`, `{{SOLUTION_TITLE}}`, `{{SOLUTION_ID}}`, `{{FEATURE_ID}}`
- **Component tokens**:  
  `{{COMPONENT_PASCAL}}`, `{{COMPONENT_CAMEL}}`, `{{COMPONENT_ID}}`
- **Environment**:  
  `{{NODE_VERSION}}` (major)

Any file ending with `.tmpl` has the suffix stripped in output.

---

## Troubleshooting

- **I’m getting an old version when using npx/create**  
  Use `@latest` explicitly (e.g., `npx create-sharepoint@latest`). If you still see stale bits:
  - Clear package manager caches (`npm cache verify` / `pnpm store prune` / `yarn cache clean`)
  - Ensure your shell isn’t shadowing a globally installed old version

- **“Requires Node ≥ 22” error**  
  Install a Node 22.x LTS and switch (`nvm use 22` / update your toolchain). The CLI can scaffold on older Node but SPFx will require Node ≥ 22 to build/serve.

- **Install step fails**  
  Re-run `npm install` (or your PM of choice) in the solution directory. Corporate proxies? Ensure `HTTPS_PROXY` / `.npmrc` are set correctly.

- **Gulp not found**  
  The generator injects `gulp` and `gulp-cli` into `devDependencies` and wires scripts. Run `npm install` and try again.

---

## FAQ

**Q: Do I have to answer prompts?**  
A: No. Provide `--template`, `--variant`, `--name`, and it’ll fly through like a well-oiled CI.

**Q: Can I force a package manager?**  
A: Yes: `--pm npm|pnpm|yarn`. Otherwise it reads your `npm_config_user_agent`.

**Q: How do I add another component later?**  
A: Run the CLI again at the solution root and choose the template/variant for the new component.

---

## License

MIT. Build responsibly, ship happily, and don’t cross the streams.
