import { injectable } from "inversify";

import Consola from "consola";

export type Logger = typeof Consola;

@injectable()
export class LoggerFactory {
  public create(scope: string): Logger {
    return Consola.withScope(scope);
  }
}
