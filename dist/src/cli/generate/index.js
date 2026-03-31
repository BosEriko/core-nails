export async function runGenerate(args) {
    const [type, name] = args;
    if (!type || !name) {
        console.error("Usage: nails generate <type> <name>");
        process.exit(1);
    }
    switch (type) {
        case "model": {
            const { generateModel } = await import("./model.js");
            await generateModel(name);
            break;
        }
        case "scaffold": {
            const { generateScaffold } = await import("./scaffold.js");
            await generateScaffold(name);
            break;
        }
        default: {
            console.error(`Unknown generator: ${type}`);
            process.exit(1);
        }
    }
}
