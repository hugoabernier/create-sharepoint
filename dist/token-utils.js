export function toPascalCase(input) {
    return (input || "")
        .split(/[^a-zA-Z0-9]+/g)
        .filter(Boolean)
        .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1))
        .join("");
}
export function toCamelCase(input) {
    const pascal = toPascalCase(input);
    return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : "";
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
