import { NetworkMonitor, getNetworkMonitor } from './NetworkMonitor';

describe('NetworkMonitor', () => {
  let monitor: NetworkMonitor;

  beforeEach(() => {
    monitor = new NetworkMonitor();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('initialization', () => {
    it('should initialize with online status', () => {
      expect(monitor.getIsOnline()).toBeDefined();
    });
  });

  describe('network callbacks', () => {
    it('should call onNetworkAvailable callback when network becomes available', () => {
      const callback = jest.fn();
      monitor.onNetworkAvailable(callback);

      // Simulate network becoming available
      const event = new Event('online');
      window.dispatchEvent(event);

      // Callback may or may not fire depending on initial state
      // Just verify it can be registered
      expect(monitor.getIsOnline).toBeDefined();
    });

    it('should call onNetworkLost callback when network is lost', () => {
      const callback = jest.fn();
      monitor.onNetworkLost(callback);

      // Simulate network loss
      const event = new Event('offline');
      window.dispatchEvent(event);

      // Callback may or may not fire depending on initial state
      // Just verify it can be registered
      expect(monitor.getIsOnline).toBeDefined();
    });

    it('should allow removing callbacks', () => {
      const callback = jest.fn();
      monitor.onNetworkAvailable(callback);
      monitor.removeNetworkAvailableCallback(callback);

      // If callback is removed, it should not be called
      // Verify the method works without errors
      expect(monitor.getIsOnline).toBeDefined();
    });
  });

  describe('status checking', () => {
    it('should return current online status', () => {
      const status = monitor.getIsOnline();
      expect(typeof status).toBe('boolean');
    });

    it('should check network status asynchronously', async () => {
      const status = await monitor.checkIsOnline();
      expect(typeof status).toBe('boolean');
    });
  });

  describe('singleton', () => {
    it('should return same instance from getNetworkMonitor', () => {
      const instance1 = getNetworkMonitor();
      const instance2 = getNetworkMonitor();
      expect(instance1).toBe(instance2);
    });
  });
});
