import sinon, { stubObject } from "ts-sinon";

import logger from "../src/utils/logger";
import { EscalationPolicyAdapter } from "../src/adapters/EscalationPolicyAdapter";
import { NotificationManager } from "../src/managers/NotificationManager";
import { NotificationSystemEvent, NotificationSystemEventAction } from "../src/types/notificationSystemEvent";
import { PersistenceAdapter, Service, ServiceNotificationStatus, ServiceStatus } from "../src/adapters/PersistenceAdapter";
import { SenderManager } from "../src/managers/SenderManager";
import { TimeoutExpiredHandler } from "../src/eventHandlers/timeoutExpiredHandler"

import MailAdapter from "../src/adapters/MailAdapter";
import SmsAdapter from "../src/adapters/SmsAdapter";

const serviceId: string = "service_id";
const mockedAlertEvent: NotificationSystemEvent = {
  "context": {
    "correlation_id": "correlation_id",
    "service_id": serviceId
  },
  "message": "message",
  "action": NotificationSystemEventAction.Alert
};


const mockUnHealthyService: Service = {
  id: serviceId,
  status: ServiceStatus.UnHealthy,
  notifications_status: ServiceNotificationStatus.Init,
  last_escalation_policy_level_used: null
};

const mockNotificationsToSendService: Service = { ...mockUnHealthyService, notifications_status: ServiceNotificationStatus.ToSend };
const mockSentService: Service = { ...mockUnHealthyService, notifications_status: ServiceNotificationStatus.Sent };
const mockHealthyCandidateService: Service = {
  id: serviceId,
  status: ServiceStatus.HealthyCandidate,
  notifications_status: ServiceNotificationStatus.Sent,
  last_escalation_policy_level_used: null
};

describe("TimeoutExpiredHandler", () => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const persistenceAdapterStub = stubObject<PersistenceAdapter>(persistenceAdapter);

  const escalationPolicyAdapter = new EscalationPolicyAdapter(logger);
  const escalationPolicyAdapterStub = stubObject<EscalationPolicyAdapter>(escalationPolicyAdapter);

  const smsAdapter = new SmsAdapter(logger);
  const smsAdapterStub = stubObject<SmsAdapter>(smsAdapter);

  const mailAdapter = new MailAdapter(logger);
  const mailAdapterStub = stubObject<MailAdapter>(mailAdapter);

  const senderManager = new SenderManager(logger, smsAdapterStub, mailAdapterStub);
  const senderManagerStub = stubObject<SenderManager>(senderManager);

  const notificationManager = new NotificationManager(logger, persistenceAdapterStub, escalationPolicyAdapterStub, senderManagerStub);
  const notificationManagerStub = stubObject<NotificationManager>(notificationManager);

  const timeoutExpiredHandler = new TimeoutExpiredHandler(logger, persistenceAdapterStub, notificationManagerStub);

  afterEach(() => {
    sinon.reset();
  });

  test("Store event log in every case", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockUnHealthyService);
    await timeoutExpiredHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.storeEventLogAsync.calledWith(mockedAlertEvent)).toBe(true);
  });

  test("Service is Healthy candidate then the service became HEALTHY", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockHealthyCandidateService);
    await timeoutExpiredHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.setServiceStatusAsync.calledWith(mockHealthyCandidateService.id, ServiceStatus.Healthy)).toBe(true);
  });

  describe("Service is UNHEALTHY, ", () => {
    test("acknowledge was received THEN pager does not send notifications", async () => {
      persistenceAdapterStub.getServiceAsync.resolves(mockUnHealthyService);
      await timeoutExpiredHandler.manageEventAsync(mockedAlertEvent);
      expect(notificationManagerStub.notifyTargetsAsync.notCalled).toBe(true);
    });
    test("notifications already sent THEN pager does not send notifications", async () => {
      persistenceAdapterStub.getServiceAsync.resolves(mockSentService);
      await timeoutExpiredHandler.manageEventAsync(mockedAlertEvent);
      expect(notificationManagerStub.notifyTargetsAsync.notCalled).toBe(true);
    });
    test("acknowledge was not received THEN pager send notifications", async () => {
      persistenceAdapterStub.getServiceAsync.resolves(mockNotificationsToSendService);
      await timeoutExpiredHandler.manageEventAsync(mockedAlertEvent);
      expect(notificationManagerStub.notifyTargetsAsync.called).toBe(true);
    });
  });
});
