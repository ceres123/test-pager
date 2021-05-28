import Pino from "pino";
import { config } from "../config";

const logger = Pino({
  name: config.APP_NAME,
  level: config.LOG_LEVEL
});

export default logger;
