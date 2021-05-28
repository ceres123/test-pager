import sinon, { stubObject } from "ts-sinon";

import logger from "../src/utils/logger";
import { ConsoleHealthyHandler } from "../src/eventHandlers/consoleHealtyHandler"
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

describe("ConsoleHealthyHandler", () => {
  const persistenceAdapter = new PersistenceAdapter(logger);
  const persistenceAdapterStub = stubObject<PersistenceAdapter>(persistenceAdapter);
  const consoleHealthyHandler = new ConsoleHealthyHandler(logger, persistenceAdapterStub);

  afterEach(() => {
    sinon.reset();
  });

  test("Store event log in every case", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockHealthyService);
    await consoleHealthyHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.storeEventLogAsync.calledWith(mockedAlertEvent)).toBe(true);
  });

  test("Does Update service status to HealthyCandidate", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockUnHealthyService);
    await consoleHealthyHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.setServiceStatusAsync.calledWith(mockHealthyService.id, ServiceStatus.HealthyCandidate)).toBe(true);
  });

  test("Does NOT Update service status to HealthyCandidate since status is already HEALTHY", async () => {
    persistenceAdapterStub.getServiceAsync.resolves(mockHealthyService);
    await consoleHealthyHandler.manageEventAsync(mockedAlertEvent);
    expect(persistenceAdapterStub.setServiceStatusAsync.notCalled).toBe(true);
  });

});
