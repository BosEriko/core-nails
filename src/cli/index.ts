#!/usr/bin/env node

const [, , command, ...args] = process.argv;

async function run() {
  switch (command) {
    case "generate": {
      const { runGenerate } = await import("./generate/index.js");
      await runGenerate(args);
      break;
    }

    default: {
      console.log(`Unknown command: ${command}`);
      console.log("Available commands: generate");
      process.exit(1);
    }
  }
}

run();
