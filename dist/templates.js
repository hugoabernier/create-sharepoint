export const VARIANT_CHOICES = {
    webpart: [
        { title: "Minimal", value: "minimal" },
        { title: "No framework", value: "no-framework" },
        { title: "React", value: "react" }
    ],
    library: [
        // keep minimal for now; expand when you add more
        { title: "Minimal", value: "minimal" }
    ],
    extension: [
        { title: "Application Customizer", value: "application-customizer" },
        { title: "Field Customizer", value: "field-customizer" },
        { title: "ListView Command Set", value: "listview-command-set" },
        { title: "Form Customizer", value: "form-customizer" },
        { title: "Search Query Modifier", value: "search-query-modifier" }
    ],
    "adaptive-card-extension": [
        { title: "Generic Card Template", value: "generic-card" },
        { title: "Search Card Template", value: "search-card" },
        { title: "Data Visualization Template", value: "data-visualization-card" }
    ]
};
export function variantLabel(extType) {
    switch (extType) {
        case "application-customizer": return "Application Customizer";
        case "field-customizer": return "Field Customizer";
        case "listview-command-set": return "ListView Command Set";
        case "form-customizer": return "Form Customizer";
        case "search-query-modifier": return "Search Query Modifier";
        default: return "extension";
    }
}
