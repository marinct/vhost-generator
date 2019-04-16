#!/usr/bin/env node
const path = require("path");
const process = require("process");
const commandLineArgs = require("command-line-args");
const chalk = require("chalk");

var library = require("../lib/index.js");

const optionDefinitions = [
  { name: "help", alias: "h", type: Boolean },
  { name: "create", alias: "c", type: Boolean },
  { name: "remove", alias: "r", type: Boolean },
  {
    name: "domain",
    alias: "d",
    type: String,
    defaultValue: `default_${new Date().getTime()}`
  },
  {
    name: "path",
    alias: "p",
    defaultValue: process.cwd(),
    type: String
  },
  {
    name: "public",
    defaultValue: "",
    type: String
  },
  {
    name: "ip",
    defaultValue: "*",
    type: String
  },
  {
    name: "port",
    defaultValue: "80",
    type: String
  },
  { name: "ssl", type: Boolean },
  { name: "template", alias: "t", defaultValue: "default", type: String }
];

const options = commandLineArgs(optionDefinitions);
if (options.help) {
  showHelp();
} else if (options.create) library.create(options);
else if (options.remove) library.remove(options);
else showHelp();

function showHelp() {
  return console.log(`
  ${chalk.bold.underline("VHost Generator v1.0")}\n
  ${chalk.red("Requires administrative rights*")}\n
  ${`Backup: ${chalk.bold(path.join(path.resolve(__dirname).replace("/bin", ""), "/backup"))}`}
  ${`Templates: ${chalk.bold(path.join(path.resolve(__dirname).replace("/bin", ""), "/templates"))}`}\n
  *Commands:
  ${chalk.bold("--help")}        Help
  ${chalk.bold("--create -c")}   Create new virtual host
  ${chalk.bold("--remove -r")}   Remove a vhost by domain\n
  *Options:
  ${chalk.bold("--domain -d")}   Domain${chalk.red("**")}
  ${chalk.bold(
    "--path   -p"
  )}   Path to project root, default: ${chalk.bold.underline(
    "curent working directory"
  )}
  ${chalk.bold(
    "--public"
  )}      Public folder, ex: public_html, web, public, default: ${chalk.bold.underline(
    "none"
  )}
  ${chalk.bold(
    "--ip"
  )}          The IP for vhost, default: ${chalk.bold.underline("*")}
  ${chalk.bold(
    "--port"
  )}        The access port for vhost, default: ${chalk.bold.underline("80")}
  ${chalk.bold("--ssl")}         Secure vhost, default: ${chalk.bold.underline(
    "false"
  )}
  ${chalk.bold(
    "--template"
  )}    Template of virtual host file, default: ${chalk.bold.underline(
    "default"
  )}
  ${chalk.red("**required")}\n
  Example:
  ${chalk.green("sudo vhost -c -d example.com")}\n`);
}
