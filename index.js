#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var chalk = require('chalk');
var prompt = require('prompt');
var semver = require('semver');
/**
 * Used arguments:
 *   -v --version - to print current version of react-native-cli and react-native dependency
 *   if you are in a RN app folder
 * init - to create a new project and npm install it
 *   --verbose - to print logs while init
 *   --version <alternative react-native package> - override default (https://registry.npmjs.org/react-native@latest),
 *      package to install, examples:
 *     - "0.22.0-rc1" - A new app will be created using a specific version of React Native from npm repo
 *     - "https://registry.npmjs.org/react-native/-/react-native-0.20.0.tgz" - a .tgz archive from any npm repo
 *     - "/Users/home/react-native/react-native-0.22.0.tgz" - for package prepared with `npm pack`, useful for e2e tests
 */

var options = require('minimist')(process.argv.slice(2));

var CLI_MODULE_PATH = function() {
  return path.resolve(
    process.cwd(),
    'node_modules',
    'reazy',
    'dist',
    'cli.js'
  );
};

var REAZY_PACKAGE_JSON_PATH = function() {
  return path.resolve(
    process.cwd(),
    'node_modules',
    'reazy',
    'package.json'
  );
};

if (options._.length === 0 && (options.v || options.version)) {
  printVersionsAndExit(REAZY_PACKAGE_JSON_PATH());
}

var cli;
var cliPath = CLI_MODULE_PATH();
if (fs.existsSync(cliPath)) {
  cli = require(cliPath);
}

var commands = options._;
if (cli && (commands[0] !== 'init')) {
  cli.default.run(options);
} else {
  if (options._.length === 0 && (options.h || options.help)) {
    console.log([
      '',
      '  Usage: reazy [command] [options]',
      '',
      '',
      '  Commands:',
      '',
      '    init <projectType> generates a new project and installs its dependencies',
      '',
      '  Options:',
      '',
      '    -h, --help    output usage information',
      '    -v, --version output the version number',
      '',
    ].join('\n'));
    process.exit(0);
  }

  if (commands.length === 0) {
    console.error(
      'You did not pass any commands, run `reazy --help` to see a list of all available commands.'
    );
    process.exit(1);
  }

  switch (commands[0]) {
  case 'init':
    init(options);
    break;
  default:
    console.error(
      'Command `%s` unrecognized. ' +
      'Make sure that you have run `npm install` and that you are inside a reazy project.',
      commands[0]
    );
    process.exit(1);
    break;
  }
}

function validateProjectName(name) {
  if (!name.match(/^[$A-Z_][0-9A-Z_$]*$/i)) {
    console.error(
      '"%s" is not a valid name for a project. Please use a valid identifier ' +
        'name (alphanumeric).',
      name
    );
    process.exit(1);
  }

  if (name === 'React') {
    console.error(
      '"%s" is not a valid name for a project. Please do not use the ' +
        'reserved word "React".',
      name
    );
    process.exit(1);
  }
}

/**
 * @param name Project name, e.g. 'AwesomeApp'.
 * @param options.verbose If true, will run 'npm install' in verbose mode (for debugging).
 * @param options.version Version of React Native to install, e.g. '0.38.0'.
 * @param options.npm If true, always use the npm command line client,
 *                       don't use yarn even if available.
 */
function init(options) {
  createProject(options);
}

function createProject(options) {
  var root = path.resolve();
  var projectName = path.basename(root);

  console.log('This will walk you through creating a new Reazy project');

  var packageJson = {
    name: projectName,
    version: '0.0.1',
    private: true
  };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson));

  run(root, projectName, options);
}

function getInstallPackage(reazyPackage) {
  var packageToInstall = 'reazy';
  var isValidSemver = semver.valid(reazyPackage);
  if (isValidSemver) {
    packageToInstall += '@' + isValidSemver;
  } else if (reazyPackage) {
    // for tar.gz or alternative paths
    packageToInstall = reazyPackage;
  }
  return packageToInstall;
}

function run(root, projectName, options) {
  // E.g. '0.38' or '/path/to/archive.tgz'
  const reazyPackage = options.version;
  var installCommand;
  console.log('Installing ' + getInstallPackage(reazyPackage) + '...');
  installCommand = 'npm install --save --save-exact ' + getInstallPackage(reazyPackage);
  if (options.verbose) {
    installCommand += ' --verbose';
  }
  try {
    execSync(installCommand, {stdio: 'inherit'});
  } catch (err) {
    console.error(err);
    console.error('Command `' + installCommand + '` failed.');
    process.exit(1);
  }
  checkNodeVersion();
  cli = require(CLI_MODULE_PATH());
  cli.default.init(root, projectName, options._[1]);
}

function checkNodeVersion() {
  var packageJson = require(REAZY_PACKAGE_JSON_PATH());
  if (!packageJson.engines || !packageJson.engines.node) {
    return;
  }
  if (!semver.satisfies(process.version, packageJson.engines.node)) {
    console.error(chalk.red(
        'You are currently running Node %s but Reazy requires %s. ' +
        'Please use a supported version of Node.\n'
      ),
      process.version,
      packageJson.engines.node);
  }
}

function printVersionsAndExit(reazyPackageJsonPath) {
  console.log('reazy-cli: ' + require('./package.json').version);
  try {
    console.log('reazy: ' + require(reazyPackageJsonPath).version);
  } catch (e) {
    console.log('reazy: n/a - not inside a Reazy project directory');
  }
  process.exit();
}
