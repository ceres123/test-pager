export enum NotificationSystemEventAction {
  Alert = "ALERT",
  CloseIncident = "CLOSE_INCIDENT",
  AcknowledgeAlert = "ACKNOWLEDGE_ALERT",
  TimeoutExpired = "TIMEOUT_EXPIRED"
}

interface Context {
  correlation_id: string
  service_id: string
}

export interface NotificationSystemEvent {
  context: Context,
  message: string,
  action: NotificationSystemEventAction
}
