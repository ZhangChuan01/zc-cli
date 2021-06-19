"use strict";

const path = require("path");
const Package = require("@zc-cli/package");
const log = require("@zc-cli/log");

const SETTINGS = {
  init: "@zc-cli/init",
};

const CACHE_DIR = "dependencies";

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir = "";
  let pkg = "";
  log.verbose("targetPath", targetPath);
  log.verbose("homePath", homePath);
  const cmdObj = arguments[arguments.length - 1];
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = "latest";

  if (!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR);
    storeDir = path.resolve(targetPath, "node_modules");
    console.log(targetPath, storeDir);
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
      storePath: storeDir,
    });
    if (await pkg.exists()) {
      //更新package
      await pkg.update();
    } else {
      //安装package
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  console.log(await pkg.exists());
  const rootFile = pkg.getRootFilePath();
  console.log("rootfile", rootFile);
  if (rootFile) {
    // console.log(Array.from(arguments));
    require(rootFile).call(null, Array.from(arguments));
  }
}

module.exports = exec;
