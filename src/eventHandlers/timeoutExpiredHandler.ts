import logger from "../utils/logger"
import P from "pino"

import { BaseHandler } from "./BaseHandler";
import { EscalationPolicyAdapter } from "../adapters/EscalationPolicyAdapter";
import { NotificationManager } from "../managers/NotificationManager";
import { NotificationSystemEvent } from "../types/notificationSystemEvent"
import { PersistenceAdapter, ServiceNotificationStatus, ServiceStatus } from "../adapters/PersistenceAdapter"
import { SenderManager } from "../managers/SenderManager";

import MailAdapter from "../adapters/MailAdapter";
import SmsAdapter from "../adapters/SmsAdapter";

export class TimeoutExpiredHandler extends BaseHandler {
  notificationManager: NotificationManager;

  constructor(log: P.Logger = logger, persistenceAdapter: PersistenceAdapter, notificationManager: NotificationManager) {
    super(log, persistenceAdapter);
    this.notificationManager = notificationManager;
  }

  async manageEventAsync(alertEvent: NotificationSystemEvent): Promise<void> {
    await this.persistenceAdapter.storeEventLogAsync(alertEvent);
    const serviceId = alertEvent.context.service_id;
    const service = await this.persistenceAdapter.getServiceAsync(serviceId);

    if (service.status === ServiceStatus.HealthyCandidate) {
      await this.persistenceAdapter.setServiceStatusAsync(serviceId, ServiceStatus.Healthy);
      return Promise.resolve();
    }
    const areNotificationsToSend = service.status === ServiceStatus.UnHealthy && service.notifications_status === ServiceNotificationStatus.ToSend;
    if (areNotificationsToSend) {
        await this.notificationManager.notifyTargetsAsync(serviceId);
      }
  }

};

export const handleTimeoutExpiredEventAsync = async (event: NotificationSystemEvent): Promise<void> => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const escalationPolicyAdapter = new EscalationPolicyAdapter(logger);
  const smsAdapter = new SmsAdapter(logger);
  const mailAdapter = new MailAdapter(logger);
  const senderManager = new SenderManager(logger, smsAdapter, mailAdapter);
  const notificationManager = new NotificationManager(logger, persistenceAdapter, escalationPolicyAdapter, senderManager);

  const timeoutExpiredHandler = new TimeoutExpiredHandler(logger, persistenceAdapter, notificationManager);
  await timeoutExpiredHandler.manageEventAsync(event);
};
