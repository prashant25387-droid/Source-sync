import { CropLog, ActivityType } from '../types';
import { dataService } from './dataService';

export interface OfflineLogEntry {
  queueId: string;
  cropRecordId: string;
  farmerId: string;
  activityType: ActivityType;
  activityDate: string;
  waterVolumeKL?: number;
  description: string;
  notes?: string;
  queuedAt: string;
  status: 'pending_sync' | 'synced' | 'failed';
}

const QUEUE_KEY = 'fasalsetu_offline_log_queue_v1';

class OfflineQueueService {
  private queue: OfflineLogEntry[] = [];
  private listeners: ((isOnline: boolean, queuedCount: number) => void)[] = [];

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  private loadQueue() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      this.queue = [];
      return;
    }
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      this.queue = stored ? JSON.parse(stored) : [];
    } catch (e) {
      this.queue = [];
    }
  }

  private saveQueue() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('Failed to save offline queue:', e);
    }
  }

  private handleNetworkChange(isOnline: boolean) {
    if (isOnline) {
      // Auto-sync pending logs when network restores
      this.syncPending();
    }
    this.notifyListeners();
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
    return navigator.onLine;
  }

  public getPendingLogs(): OfflineLogEntry[] {
    return this.queue.filter(item => item.status === 'pending_sync');
  }

  public getPendingCount(): number {
    return this.getPendingLogs().length;
  }

  public queueLog(log: Omit<CropLog, 'id' | 'createdAt'>): OfflineLogEntry {
    const entry: OfflineLogEntry = {
      ...log,
      queueId: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      queuedAt: new Date().toISOString(),
      status: 'pending_sync',
    };

    this.queue.unshift(entry);
    this.saveQueue();
    this.notifyListeners();

    // If currently online, attempt immediate sync in background
    if (this.isOnline()) {
      this.syncItem(entry);
    }

    return entry;
  }

  public syncItem(entry: OfflineLogEntry): boolean {
    try {
      dataService.addLog({
        cropRecordId: entry.cropRecordId,
        farmerId: entry.farmerId,
        activityType: entry.activityType,
        activityDate: entry.activityDate,
        waterVolumeKL: entry.waterVolumeKL,
        description: entry.description,
        notes: entry.notes ? `${entry.notes} (सहेजा: ऑफलाइन सिंक)` : undefined,
      });

      entry.status = 'synced';
      // Remove synced entry from local queue
      this.queue = this.queue.filter(q => q.queueId !== entry.queueId);
      this.saveQueue();
      this.notifyListeners();
      return true;
    } catch (err) {
      entry.status = 'failed';
      this.saveQueue();
      return false;
    }
  }

  public syncPending(): { synced: number; failed: number } {
    const pending = this.getPendingLogs();
    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      const ok = this.syncItem(item);
      if (ok) synced++;
      else failed++;
    }

    this.notifyListeners();
    return { synced, failed };
  }

  public subscribe(callback: (isOnline: boolean, queuedCount: number) => void): () => void {
    this.listeners.push(callback);
    callback(this.isOnline(), this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    const online = this.isOnline();
    const count = this.getPendingCount();
    this.listeners.forEach(cb => {
      try {
        cb(online, count);
      } catch (e) {
        // ignore
      }
    });
  }
}

export const offlineQueueService = new OfflineQueueService();
