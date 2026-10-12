require('ts-node').register({ transpileOnly: true });
const cfg = require("./medusa-config.ts").default;

console.log("Config keys:", Object.keys(cfg));
console.log("Has modules?:", "modules" in cfg);
console.log("modules value:", cfg.modules);
console.log("type of modules:", typeof cfg.modules);
console.log("isArray?:", Array.isArray(cfg.modules));
console.log("Full config:", JSON.stringify(cfg, null, 2));
