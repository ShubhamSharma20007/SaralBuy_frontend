export const fallBackName = (name: string | undefined | null) => {
    if (typeof name !== "string" || !name.trim()) {
        return "?";
    }
    let fallback = "";
    name.split(" ").forEach((part: string) => {
        if (part && typeof part[0] === "string") {
            fallback += part[0].toUpperCase();
        }
    });
    return fallback || "?";
}