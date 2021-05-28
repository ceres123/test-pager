import sinon, { stubObject } from "ts-sinon";

import { AlertEventHandler } from "../src/eventHandlers/alertHandler";
import { NotificationSystemEvent, NotificationSystemEventAction } from "../src/types/notificationSystemEvent";
import { PersistenceAdapter, Service, ServiceNotificationStatus, ServiceStatus } from "../src/adapters/PersistenceAdapter";
import logger from "../src/utils/logger";
import { NotificationManager } from "../src/managers/NotificationManager";
import TimerAdapter from "../src/adapters/TimerAdapter";
import SmsAdapter from "../src/adapters/SmsAdapter";
import MailAdapter from "../src/adapters/MailAdapter";
import { SenderManager } from "../src/managers/SenderManager";
import { EscalationPolicyAdapter } from "../src/adapters/EscalationPolicyAdapter";

const serviceId: string = "service_id";
const mockedAlertEvent: NotificationSystemEvent = {
  "context": {
    "correlation_id": "correlation_id",
    "service_id": serviceId
  },
  "message": "message",
  "action": NotificationSystemEventAction.Alert
};

const mockService: Service = {
  id: serviceId,
  status: ServiceStatus.Healthy,
  notifications_status: ServiceNotificationStatus.Init,
  last_escalation_policy_level_used: null
};


describe("AlertEventHandler", () => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const persistenceAdapterStub = stubObject<PersistenceAdapter>(persistenceAdapter);

  const escalationPolicyAdapter = new EscalationPolicyAdapter(logger);
  const escalationPolicyAdapterStub = stubObject<EscalationPolicyAdapter>(escalationPolicyAdapter);

  const smsAdapter = new SmsAdapter(logger);
  const smsAdapterStub = stubObject<SmsAdapter>(smsAdapter);

  const mailAdapter = new MailAdapter(logger);
  const mailAdapterStub = stubObject<MailAdapter>(mailAdapter);

  const timerAdapter = new TimerAdapter(logger);
  const timerAdapterStub = stubObject<TimerAdapter>(timerAdapter);

  const senderManager = new SenderManager(logger, smsAdapterStub, mailAdapterStub);
  const senderManagerStub = stubObject<SenderManager>(senderManager);

  const notificationManager = new NotificationManager(logger, persistenceAdapterStub, escalationPolicyAdapterStub, senderManagerStub);
  const notificationManagerStub = stubObject<NotificationManager>(notificationManager);

  const alertHandler = new AlertEventHandler(logger, persistenceAdapterStub, notificationManagerStub, timerAdapterStub);

  afterEach(() => {
    sinon.reset();
  });

  test("Store event log in every case", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockService);
    await alertHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.storeEventLogAsync.calledWith(mockedAlertEvent)).toBe(true);
  });

  describe("Service is UNHEALTHY: ", () => {
    test("service remain UNHEALTHY", async () => {
      persistenceAdapterStub.getServiceAsync.resolves({...mockService, status: ServiceStatus.UnHealthy});
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(persistenceAdapterStub.setServiceStatusAsync.notCalled).toBe(true);
    });
    test("does not send notification", async () => {
      persistenceAdapterStub.getServiceAsync.resolves({...mockService, status: ServiceStatus.UnHealthy});
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(notificationManagerStub.notifyTargetsAsync.notCalled).toBe(true);
    });
    test("does not set timeout", async () => {
      persistenceAdapterStub.getServiceAsync.resolves({...mockService, status: ServiceStatus.UnHealthy});
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(timerAdapterStub.setAcknowledgementTimeoutAsync.notCalled).toBe(true);
    });
  });

  describe("Service is HEALTHY: ", () => {
    test("service became UNHEALTHY", async () => {
      persistenceAdapterStub.getServiceAsync.resolves(mockService);
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(persistenceAdapterStub.setServiceStatusAsync.calledOnceWith(serviceId, ServiceStatus.UnHealthy)).toBe(true);
    });

    test("Pager eventually notify to targets", async () => {
      persistenceAdapterStub.getServiceAsync.resolves(mockService);
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(notificationManagerStub.notifyTargetsAsync.calledWith(mockService.id)).toBe(true);
    });

    test("Pager sets an acknowledgement delay", async () => {
      timerAdapterStub.isAcknowledgementTimeoutExpiredAsync.resolves(true);
      persistenceAdapterStub.getServiceAsync.resolves(mockService);
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(timerAdapterStub.setAcknowledgementTimeoutAsync.calledWith(mockService.id)).toBe(true);
    });

    test("Pager has already set acknowledgement timeout and is not expired, pager does not set another timeout", async () => {
      timerAdapterStub.isAcknowledgementTimeoutExpiredAsync.resolves(false);
      persistenceAdapterStub.getServiceAsync.resolves(mockService);
      await alertHandler.manageEventAsync(mockedAlertEvent);
      expect(timerAdapterStub.setAcknowledgementTimeoutAsync.notCalled).toBe(true);
    });
  });
});
