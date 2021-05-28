import logger from "../utils/logger"
import P from "pino"

import { PersistenceAdapter } from "../adapters/PersistenceAdapter"

export class BaseHandler {
  log: P.Logger;
  persistenceAdapter: PersistenceAdapter;

  constructor(log: P.Logger = logger, persistenceAdapter: PersistenceAdapter) {
    this.log = log;
    this.persistenceAdapter = persistenceAdapter;
  }
};
