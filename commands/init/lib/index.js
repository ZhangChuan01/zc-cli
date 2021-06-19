"use strict";

const Command = require("@zc-cli/command");

class InitCommand extends Command {}

function init(argv) {
  console.log("init", 666);
  this._argv = argv;
  // return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
