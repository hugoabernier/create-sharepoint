export function toPascalCase(input) {
    return (input || "")
        .replace(/[/_.-]+/g, " ")
        .replace(/(\w)(\w*)/g, (_, a, b) => a.toUpperCase() + b.toLowerCase())
        .replace(/\s+/g, "");
}
export function toCamelCase(input) {
    const p = toPascalCase(input);
    return p ? p[0].toLowerCase() + p.slice(1) : p;
}
export function toTitleCase(input) {
    return (input || "")
        .replace(/[/_.-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/(\w)(\w*)/g, (_, a, b) => a.toUpperCase() + b.toLowerCase());
}
export function newUpperGuid() {
    // node >= 16: crypto.randomUUID()
    const g = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : "00000000-0000-4000-8000-000000000000";
    return g.toUpperCase();
}
