import logger from "../utils/logger"
import P from "pino"

import { BaseHandler } from "./BaseHandler";
import { NotificationSystemEvent } from "../types/notificationSystemEvent"
import { PersistenceAdapter, ServiceStatus } from "../adapters/PersistenceAdapter"


export class AcknowledgedAlertHandler extends BaseHandler {

  constructor(log: P.Logger = logger, persistenceAdapter: PersistenceAdapter) {
    super(log, persistenceAdapter);
  }

  async manageEventAsync(alertEvent: NotificationSystemEvent): Promise<void> {
    await this.persistenceAdapter.storeEventLogAsync(alertEvent);
    const serviceId = alertEvent.context.service_id;
    const service = await this.persistenceAdapter.getServiceAsync(serviceId);
    if (service.status === ServiceStatus.UnHealthy) {
      await this.persistenceAdapter.setAlertAcknowledgedAsync(serviceId);
    }
  }
};

export const handleAcknowledgedAlertEventAsync = async (event: NotificationSystemEvent): Promise<void> => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const acknowledgedAlertHandler = new AcknowledgedAlertHandler(logger, persistenceAdapter);
  await acknowledgedAlertHandler.manageEventAsync(event);
};
