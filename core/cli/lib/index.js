"use strict";

module.exports = core;

const semver = require("semver");
const colors = require("colors/safe");
const pkg = require("../package.json");
const log = require("@zc-cli/log");
const constant = require("./const");

function core() {
  // TODO
  checkPkgVersion();
  checkNodeVersion();
}

function checkNodeVersion() {
  const currentVersion = process.version;
  console.log(currentVersion);
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`zc-cli 需要安装 v${lowestVersion}以上版本的Node.js`)
    );
  }
}

function checkPkgVersion() {
  log.notice(pkg.version);
}
