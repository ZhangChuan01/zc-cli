"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const pathExists = require("path-exists");
const commander = require("commander");
const pkg = require("../package.json");
const log = require("@zc-cli/log");
const init = require("@zc-cli/init");
const exec = require("@zc-cli/exce");
const constant = require("./const");
const { constants } = require("buffer");

const program = new commander.Command();

function core() {
  try {
    prepare();
    registerCommand();
  } catch (error) {
    log.error(error.message);
    if (process.env.LOG_LEVEL === "verbose") {
      console.log(e);
    }
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-tp, --targetPath <targetPath>", "是否制定本地调试文件路径")
    .option("-d, --debug", "是否开启调试模式", false);

  program
    .command("init [projectName]")
    // .option("-tp, --targetPath <targetPath>", "是否制定本地调试文件路径")
    .option("-f, --force", "是否强制初始化项目")
    .action(exec);

  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program._optionValues.targetPath;
  });

  program.on("option:debug", function () {
    process.env.LOG_LEVEL = "verbose";
    log.level = process.env.LOG_LEVEL;
  });

  program.on("command:*", function (obj) {
    console.log(colors.red("未知命令: " + obj[0]));
    const availableCommands = program.commands.map((cmd) => cmd.name());
    if (availableCommands.length > 0) {
      console.log(colors.red("可用命令: " + availableCommands.join(",")));
    }
  });

  if (program.args && process.argv.length < 1) {
    program.outputHelp();
  }

  program.parse(process.argv);
}

function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome();
  checkEnv();
  checkGlobalUpdate();
}

async function checkGlobalUpdate() {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersions } = require("@zc-cli/get-npm-info");
  const lastVersion = await getNpmSemverVersions(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      colors.yellow(`请手动更新${npmName},当前版本: ${currentVersion},最新版本: ${lastVersion}
    更新命令:  npm install -g ${npmName}`)
    );
  }
}

function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  if (dotenvPath) {
    dotenv.config({
      path: dotenvPath,
    });
  }
  createDefaultConfig();
  // log.verbose("环境变量", process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constants.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

// function checkInputArgs() {
//   const minimist = require("minimist");
//   const args = minimist(process.argv.slice(2));
//   checkArgs(args);
// }

// function checkArgs(args) {
//   if (args.debug) {
//     process.env.LOG_LEVEL = "verbose";
//   } else {
//     process.env.LOG_LEVEL = "info";
//   }
//   log.level = process.env.LOG_LEVEL;
// }

function checkRoot() {
  const rootCheck = require("root-check");
  rootCheck();
}

function checkUserHome() {
  if (!userHome || !pathExists(userHome)) {
    throw new Error(colors.red("当前登录用户主目录不存在"));
  }
}

function checkNodeVersion() {
  const currentVersion = process.version;
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
