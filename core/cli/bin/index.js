#! /usr/bin/env node

// const importLocal = require("import-local");

// if (importLocal(__filename)) {
//   require("npmlog").info("cli", "正在使用zc-cli 本地版本");
// } else {
// require("../lib")(process.argv.slice(2));
// }

const core = require("../lib");
core();
