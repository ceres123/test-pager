import logger from "../utils/logger"
import P from "pino"

class BaseAdapter {
  log: P.Logger
  constructor(log: P.Logger = logger) {
    this.log = log;
  }
}

export default BaseAdapter;
