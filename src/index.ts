import { handleAcknowledgedAlertEventAsync } from "./eventHandlers/acknowledgedAlertHandler"
import { handleAlertEventAsync } from "./eventHandlers/alertHandler"
import { handleConsoleHealthyEventAsync } from "./eventHandlers/consoleHealtyHandler"
import { handleTimeoutExpiredEventAsync } from "./eventHandlers/timeoutExpiredHandler"
import { NotificationSystemEventAction, NotificationSystemEvent } from "./types/notificationSystemEvent"

const handlerEventMapping = {
  [NotificationSystemEventAction.AcknowledgeAlert]: handleAcknowledgedAlertEventAsync,
  [NotificationSystemEventAction.Alert]: handleAlertEventAsync,
  [NotificationSystemEventAction.CloseIncident]: handleConsoleHealthyEventAsync,
  [NotificationSystemEventAction.TimeoutExpired]: handleTimeoutExpiredEventAsync,
}

const start = (event: NotificationSystemEvent) => {
  return handlerEventMapping[event.action];
}
