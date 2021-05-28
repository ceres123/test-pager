import logger from "../utils/logger"
import P from "pino"

import { BaseHandler } from "./BaseHandler";
import { EscalationPolicyAdapter } from "../adapters/EscalationPolicyAdapter";
import { NotificationSystemEvent } from "../types/notificationSystemEvent"
import { NotificationManager } from "../managers/NotificationManager";
import { PersistenceAdapter, ServiceStatus } from "../adapters/PersistenceAdapter"
import { SenderManager } from "../managers/SenderManager";

import SmsAdapter from "../adapters/SmsAdapter";
import MailAdapter from "../adapters/MailAdapter";
import TimerAdapter from "../adapters/TimerAdapter";


export class AlertEventHandler extends BaseHandler {
  notificationManager: NotificationManager;
  timerAdapter: TimerAdapter;

  constructor(log: P.Logger = logger, persistenceAdapter: PersistenceAdapter, notificationManager: NotificationManager, timerAdapter: TimerAdapter) {
    super(log, persistenceAdapter);
    this.notificationManager = notificationManager;
    this.timerAdapter = timerAdapter;
  }

  async manageEventAsync(alertEvent: NotificationSystemEvent): Promise<void> {
    await this.persistenceAdapter.storeEventLogAsync(alertEvent);
    const serviceId = alertEvent.context.service_id;
    const service = await this.persistenceAdapter.getServiceAsync(serviceId);
    if (service.status === ServiceStatus.Healthy) {
      await this.persistenceAdapter.setServiceStatusAsync(serviceId, ServiceStatus.UnHealthy);
      await this.notificationManager.notifyTargetsAsync(serviceId);
      const isAcknowledgementTimeoutExpired = await this.timerAdapter.isAcknowledgementTimeoutExpiredAsync(serviceId);
      if (isAcknowledgementTimeoutExpired) {
        await this.timerAdapter.setAcknowledgementTimeoutAsync(serviceId);
      }
    }
  }
};

export const handleAlertEventAsync = async (event: NotificationSystemEvent): Promise<void> => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const escalationPolicyAdapter = new EscalationPolicyAdapter(logger);
  const smsAdapter = new SmsAdapter(logger);
  const mailAdapter = new MailAdapter(logger);
  const timerAdapter = new TimerAdapter(logger);
  const senderManager = new SenderManager(logger, smsAdapter, mailAdapter);
  const notificationManager = new NotificationManager(logger, persistenceAdapter, escalationPolicyAdapter, senderManager);
  const alertHandler = new AlertEventHandler(logger, persistenceAdapter, notificationManager, timerAdapter);

  await alertHandler.manageEventAsync(event);

};
