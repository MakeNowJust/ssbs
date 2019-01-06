import path from "path";

import chokidar from "chokidar";
import chalk from "chalk";
import { injectable, inject } from "inversify";
import { Observable } from "rxjs";

import { Options } from "./Options";
import { Logger, LoggerCreator } from "./Logger";

export interface FileUpdate {
  id: number;
  event: string;
  filepath: string;
}

@injectable()
export class Watcher {
  public readonly logger: Logger;
  public readonly opts: Options;

  public readonly watcher!: chokidar.FSWatcher;

  constructor(loggerCreator: LoggerCreator, opts: Options) {
    this.logger = loggerCreator.create("watcher");
    this.opts = opts;
  }

  public async start(): Promise<void> {
    (this as any).watcher = chokidar.watch(this.opts.dir);
    await new Promise((resolve, reject) => {
      this.watcher.once("ready", resolve);
      this.watcher.once("error", reject);
    });

    this.logger.info(
      `watch ${chalk.underline(
        path.relative(process.cwd(), this.opts.dir) || "."
      )}`
    );
  }

  public watch(): Observable<FileUpdate> {
    return new Observable<FileUpdate>(observer => {
      let id = 0;
      const handler = (event: string, filepath: string) => {
        observer.next({ id, event, filepath });
        id += 1;
      };

      this.watcher.on("all", handler);
      return () => this.watcher.off("all", handler);
    });
  }
}