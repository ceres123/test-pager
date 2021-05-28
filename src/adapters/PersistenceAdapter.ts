import { NotificationSystemEvent } from "../types/notificationSystemEvent";
import BaseAdapter from "./BaseAdapter"

export enum ServiceStatus {
  Healthy = "HEALTHY",
  UnHealthy = "UNHEALTHY",
  HealthyCandidate = "HEALTHY_CANDIDATE"
}

export enum ServiceNotificationStatus {
  Acknowledged = "ACKNOWLEDGED",
  Sent = "SENT",
  Error = "ERROR",
  ToSend = "TO_SEND",
  Init = "INIT",
}

export interface Service {
  id: string,
  status: ServiceStatus,
  notifications_status: ServiceNotificationStatus,
  last_escalation_policy_level_used: number | null,
}


// I assume here Read Committed Isolation Level
export class PersistenceAdapter extends BaseAdapter {
  async storeEventLogAsync(event: NotificationSystemEvent): Promise<void> {
    this.log.info("storeEventLogAsync");
  }

  // SERVICE REPOSITORY
  //@ts-ignore
  async getServiceAsync(serviceId: string): Promise<Service> {
    this.log.info(`getService ${serviceId}`);
  }
  //@ts-ignore
  async setServiceStatusAsync(serviceId: string, status: ServiceStatus): Promise<Service> {
    this.log.info("setServiceStatusAsync");
  }
  //@ts-ignore
  async setServiceNotificationStatusAsync(serviceId: string, status: ServiceNotificationStatus): Promise<Service> {
    this.log.info("setServiceStatusAsync");
  }
  async setAcknowledgeTimeoutAsync(serviceId: string): Promise<void> {
    this.log.info("setAcknowledgeTimeoutAsync");
  }
  async incrementEscalationPolicyLevelAsync(serviceId: string): Promise<void> {
    this.log.info("incrementEscalationPolicyLevelAsync");
  }
  async setAlertAcknowledgedAsync(serviceId: string): Promise<void> {
    this.log.info("setAlertAcknoledgedAsync");
  }
  async setSendingNotificationErrorAsync(serviceId: string): Promise<void> {
    this.log.info("setSendingNotificationError");
  }
};
