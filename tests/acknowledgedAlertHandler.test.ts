import sinon, { stubObject } from "ts-sinon";

import logger from "../src/utils/logger";
import { AcknowledgedAlertHandler } from "../src/eventHandlers/acknowledgedAlertHandler"
import { PersistenceAdapter, Service, ServiceNotificationStatus, ServiceStatus } from "../src/adapters/PersistenceAdapter";
import { NotificationSystemEvent, NotificationSystemEventAction } from "../src/types/notificationSystemEvent";

const serviceId: string = "service_id";
const mockedAlertEvent: NotificationSystemEvent = {
  "context": {
    "correlation_id": "correlation_id",
    "service_id": serviceId
  },
  "message": "message",
  "action": NotificationSystemEventAction.AcknowledgeAlert
};

const mockHealthyService: Service = {
  id: serviceId,
  status: ServiceStatus.Healthy,
  notifications_status: ServiceNotificationStatus.Init,
  last_escalation_policy_level_used: null
};

const mockUnHealthyService: Service = { ...mockHealthyService, status: ServiceStatus.UnHealthy };

describe("AcknowledgedAlertHandler", () => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const persistenceAdapterStub = stubObject<PersistenceAdapter>(persistenceAdapter);
  const acknowledgedAlertHandler = new AcknowledgedAlertHandler(logger, persistenceAdapterStub);

  afterEach(() => {
    sinon.reset();
  });

  test("Store event log in every case", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockHealthyService);
    await acknowledgedAlertHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.storeEventLogAsync.calledWith(mockedAlertEvent)).toBe(true);
  });

  test("Service is UNHEALTHY pager update status = ACKNOWLEDGED  data model", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockUnHealthyService);
    await acknowledgedAlertHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.setAlertAcknowledgedAsync.calledWith(mockedAlertEvent["context"]["service_id"])).toBe(true);
  });

  test("Service is HEALTHY pager does not update service_notification_status", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockHealthyService);
    await acknowledgedAlertHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.setAlertAcknowledgedAsync.notCalled).toBe(true);
  });

});
