import "reflect-metadata";

import path from "path";

import arg from "arg";
import chalk from "chalk";
import consola from "consola";

import { bootstrap } from "./bootstrap";
import { Application } from "./Application";

import pkg from "../package.json";

const spec = {
  "-h": "--help",
  "--help": Boolean,

  "-v": "--version",
  "--version": Boolean,

  "--host": String,
  "--port": Number,

  "-d": "--delay",
  "--delay": Number,

  "--open": Boolean
};

const help = () => {
  console.log(chalk`
  {green ssbs} - static serve + browser sync

  {bold USAGE}

    {bold $} {green ssbs} {underline [dir]}

    Serve specified directory with browser sync.
    When no directory is specified, then it serves current directory.

  {bold OPTIONS}

    -h, --help          Show this help

    -h, --help          Show version

    --host {underline host}         Specify a hostname on which to listen
                        [{bold default:} {green 'localhost'}]

    --port {underline port}         Specify a port on which to listen
                        [{bold default:} {yellow 4567}]

    -d, --delay {underline ms}      Specify a delay time to reload
                        [{bold default:} {yellow 300}]

    --open              Open a browser
  `);
};

const main = async () => {
  const options = arg(spec);

  if (options["--help"]) {
    help();
    return;
  }

  if (options["--version"]) {
    console.log(pkg.version);
    return;
  }

  const host = options["--host"] || "localhost";
  const port = options["--port"] || 4567;
  const delay = options["--delay"] || 300;
  const open = options["--open"] || false;

  const dirs = options._;
  if (dirs.length === 0) {
    dirs.push(".");
  }
  if (dirs.length !== 1) {
    const err = new Error(chalk`Specify only one {underline dir}`);
    (err as any).code = "ARG_UNKNOWN_OPTION";
    throw err;
  }
  const dir = path.resolve(process.cwd(), dirs[0]);

  await bootstrap({ host, port, delay, open, dir }, Application);
};

main().catch(err => {
  if (err && err.code === "ARG_UNKNOWN_OPTION") {
    consola.error(err.message);
  } else {
    consola.error(err);
  }
  process.exit(1);
});
