/**
 * Unit tests for NetworkMonitor service
 */

import { NetworkMonitor } from '../../common/services/NetworkMonitor';

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
  addEventListener: jest.fn(),
}));

import NetInfo from '@react-native-community/netinfo';

describe('NetworkMonitor', () => {
  let monitor: NetworkMonitor;

  beforeEach(() => {
    monitor = new NetworkMonitor();
    jest.clearAllMocks();
  });

  afterEach(() => {
    monitor.destroy();
  });

  describe('initialization', () => {
    it('should initialize with correct network state', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(() => {
        // Unsubscribe function
      });

      await monitor.initialize();

      expect(NetInfo.fetch).toHaveBeenCalled();
      expect(monitor.isOnlineSync()).toBe(true);
    });

    it('should handle initialization error gracefully', async () => {
      (NetInfo.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      await monitor.initialize();

      expect(monitor.isOnlineSync()).toBe(false);
    });
  });

  describe('isOnline', () => {
    it('should return current network status', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });

      const result = await monitor.isOnline();

      expect(result).toBe(true);
      expect(NetInfo.fetch).toHaveBeenCalled();
    });

    it('should return false when network is unavailable', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      const result = await monitor.isOnline();

      expect(result).toBe(false);
    });
  });

  describe('network state callbacks', () => {
    it('should call onNetworkAvailable callback when network becomes available', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: false,
      });

      let unsubscribeFn: (() => void) | null = null;
      (NetInfo.addEventListener as jest.Mock).mockImplementation(
        (_callback: (state: { isConnected: boolean }) => void) => {
          unsubscribeFn = () => {
            // Unsubscribe function
          };
          return unsubscribeFn;
        }
      );

      await monitor.initialize();

      const callback = jest.fn();
      monitor.onNetworkAvailable(callback);

      // Simulate network becoming available
      const netInfoCallback = (NetInfo.addEventListener as jest.Mock).mock
        .calls[0][0];
      netInfoCallback({ isConnected: true });

      expect(callback).toHaveBeenCalled();
    });

    it('should call onNetworkLost callback when network is lost', async () => {
      (NetInfo.fetch as jest.Mock).mockResolvedValue({
        isConnected: true,
      });

      let unsubscribeFn: (() => void) | null = null;
      (NetInfo.addEventListener as jest.Mock).mockImplementation(
        (_callback: (state: { isConnected: boolean }) => void) => {
          unsubscribeFn = () => {
            // Unsubscribe function
          };
          return unsubscribeFn;
        }
      );

      await monitor.initialize();

      const callback = jest.fn();
      monitor.onNetworkLost(callback);

      // Simulate network being lost
      const netInfoCallback = (NetInfo.addEventListener as jest.Mock).mock
        .calls[0][0];
      netInfoCallback({ isConnected: false });

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('callback management', () => {
    it('should remove network available callback', () => {
      const callback = jest.fn();
      monitor.onNetworkAvailable(callback);
      monitor.removeNetworkAvailableCallback(callback);

      // Callback should not be stored
      expect(monitor['networkAvailableCallbacks'].length).toBe(0);
    });

    it('should remove network lost callback', () => {
      const callback = jest.fn();
      monitor.onNetworkLost(callback);
      monitor.removeNetworkLostCallback(callback);

      // Callback should not be stored
      expect(monitor['networkLostCallbacks'].length).toBe(0);
    });
  });

  describe('destroy', () => {
    it('should clean up resources on destroy', () => {
      const unsubscribeFn = jest.fn();
      (NetInfo.addEventListener as jest.Mock).mockReturnValue(
        unsubscribeFn
      );

      monitor['unsubscribe'] = unsubscribeFn;

      monitor.destroy();

      expect(unsubscribeFn).toHaveBeenCalled();
    });
  });
});
