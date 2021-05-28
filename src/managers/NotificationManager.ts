import P from "pino";

import logger from "../utils/logger";
import { BaseManager } from "./BaseManager";
import { EscalationPolicyAdapter, Target } from "../adapters/EscalationPolicyAdapter";
import { PersistenceAdapter, ServiceNotificationStatus } from "../adapters/PersistenceAdapter";
import { SenderManager } from "./SenderManager";


export class NotificationManager extends BaseManager {
  escalationPolicyAdapter: EscalationPolicyAdapter;
  senderManager: SenderManager;

  constructor(log: P.Logger = logger, persistenceAdapter: PersistenceAdapter, escalationPolicyAdapter: EscalationPolicyAdapter, senderManager: SenderManager) {
    super(log, persistenceAdapter);
    this.escalationPolicyAdapter = escalationPolicyAdapter;
    this.senderManager = senderManager;
  }

  buildMessage(serviceId: string): string {
    return `This is an alert to notify error, service: ${serviceId}`
  }

  async getTargetsToNotifyAsync(serviceId: string): Promise<Target[]> {
    const service = await this.persistenceAdapter.getServiceAsync(serviceId);
    const escalationPolicyServiceLevel = service.last_escalation_policy_level_used === null ? 1 : service.last_escalation_policy_level_used;
    const targets = await this.escalationPolicyAdapter.getTargetsByLevelAsync(serviceId, escalationPolicyServiceLevel);
    return targets;
  }


  async notifyTargetsAsync(serviceId: string): Promise<void> {
    try {
      const service = await this.persistenceAdapter.getServiceAsync(serviceId);
      const areNotificationsToSend = service.notifications_status === ServiceNotificationStatus.Init || service.notifications_status === ServiceNotificationStatus.ToSend;
      if (!areNotificationsToSend) {
        return
      }
      const targets = await this.getTargetsToNotifyAsync(serviceId);
      const message = this.buildMessage(serviceId);
      const notificationsToSend = targets.map(target => ({...target, message}));
      const sendAllNotification = notificationsToSend.map(() => this.senderManager.sendAsync);
      await Promise.all(sendAllNotification);
      await this.persistenceAdapter.incrementEscalationPolicyLevelAsync(serviceId);
      await this.persistenceAdapter.setServiceNotificationStatusAsync(serviceId, ServiceNotificationStatus.Sent);
    } catch(err) {
      await this.persistenceAdapter.setSendingNotificationErrorAsync(serviceId);
      throw Error("Notify Error")
    }
  }
};
