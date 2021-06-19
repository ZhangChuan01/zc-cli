"use strict";

const path = require("path");
const fse = require("fs-extra");
const pkgDir = require("pkg-dir").sync;
const npminstall = require("npminstall");
const pathExists = require("path-exists").sync;

const { isObject } = require("@zc-cli/utils");
const {
  getDefaultRegisty,
  getNpmLastestVersion,
} = require("@zc-cli/get-npm-info");
const formatPath = require("@zc-cli/format-path");

class Package {
  constructor(options) {
    if (!options) {
      throw new Error("package类的options参数不能为空");
    }
    if (!isObject(options)) {
      throw new Error("Package类的options参数必须为对象");
    }
    this.targetPath = options.targetPath;
    this.storePath = options.storePath;
    this.packageName = options.packageName;
    this.packageVersion = options.packageVersion;
    this.cacheFilePathPrefix = this.packageName.replace("/", "_");
  }

  async prepare() {
    if (this.storePath && !pathExists(this.storePath)) {
      fse.mkdirpSync(this.storePath);
    }
    if (this.packageVersion === "latest") {
      this.packageVersion = await getNpmLastestVersion(this.packageName);
    }
  }

  get cacheFilePath() {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }
  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(
      this.storePath,
      `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`
    );
  }

  async exists() {
    if (this.storePath) {
      await this.prepare();
      return pathExists(this.cacheFilePath);
    } else {
      return pathExists(this.targetPath);
    }
  }
  async install() {
    console.log("install");
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegisty,
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
    });
  }
  async update() {
    console.log("update");
    await this.prepare();
    const latestPackageVersion = await getNpmLastestVersion(this.packageName);
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
    if (!pathExists(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        storeDir: this.storePath,
        registry: getDefaultRegisty,
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
      });
      this.packageVersion = latestPackageVersion;
    }
  }
  getRootFilePath() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath);
      if (dir) {
        const pkgFile = require(path.resolve(dir, "package.json"));
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
        return null;
      }
    }
    if (this.storePath) {
      return _getRootFile(this.cacheFilePath);
    } else {
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
