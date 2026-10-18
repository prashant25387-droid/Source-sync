import { describe, it, expect, beforeEach } from 'vitest';
import { offlineQueueService } from './offlineQueueService';
import { dataService } from './dataService';

// Setup in-memory localStorage mock for node test runner
const storageMock: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storageMock[key] ?? null,
  setItem: (key: string, value: string) => { storageMock[key] = value; },
  removeItem: (key: string) => { delete storageMock[key]; },
  clear: () => { Object.keys(storageMock).forEach(k => delete storageMock[k]); },
};
// @ts-expect-error Mocking global localStorage
globalThis.localStorage = localStorageMock;

describe('Offline Queue Service - Patchy 3G/4G Network Resilience', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('queues a log entry locally with pending_sync status', () => {
    const entry = offlineQueueService.queueLog({
      cropRecordId: 'crop-2',
      farmerId: 'farmer-1',
      activityType: 'Irrigation',
      activityDate: new Date().toISOString(),
      waterVolumeKL: 60,
      description: '2 hours pump irrigation cycle',
      notes: 'Recorded in low network area',
    });

    expect(entry).toBeDefined();
    expect(entry.queueId).toBeDefined();
    expect(entry.waterVolumeKL).toBe(60);
    expect(entry.activityType).toBe('Irrigation');
  });

  it('handles sync of queued records into dataService when network restores', () => {
    const initialLogCount = dataService.getLogs('crop-2').length;

    // Simulate being offline during queuing
    const originalIsOnline = offlineQueueService.isOnline;
    offlineQueueService.isOnline = () => false;

    // Queue 2 entries while offline
    offlineQueueService.queueLog({
      cropRecordId: 'crop-2',
      farmerId: 'farmer-1',
      activityType: 'Fertilizer Application',
      activityDate: new Date().toISOString(),
      description: 'Applied 1 bag urea',
    });

    offlineQueueService.queueLog({
      cropRecordId: 'crop-2',
      farmerId: 'farmer-1',
      activityType: 'Irrigation',
      activityDate: new Date().toISOString(),
      waterVolumeKL: 100,
      description: '100 KL drip cycle',
    });

    expect(offlineQueueService.getPendingCount()).toBe(2);

    // Network restores
    offlineQueueService.isOnline = originalIsOnline;
    const result = offlineQueueService.syncPending();
    expect(result.synced).toBe(2);
    expect(offlineQueueService.getPendingCount()).toBe(0);

    const updatedLogCount = dataService.getLogs('crop-2').length;
    expect(updatedLogCount).toBe(initialLogCount + 2);
  });

  it('allows subscription to offline network and queue status', () => {
    let notifiedCount = -1;
    const unsubscribe = offlineQueueService.subscribe((online, count) => {
      notifiedCount = count;
    });

    expect(notifiedCount).toBeGreaterThanOrEqual(0);
    unsubscribe();
  });
});
