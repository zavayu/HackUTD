import { getDatabaseStatus } from '../database';

describe('Database Configuration', () => {
  describe('getDatabaseStatus', () => {
    it('should return connection status object', () => {
      const status = getDatabaseStatus();
      
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('readyState');
      expect(typeof status.isConnected).toBe('boolean');
      expect(typeof status.readyState).toBe('number');
    });

    it('should indicate disconnected state initially', () => {
      const status = getDatabaseStatus();
      
      expect(status.isConnected).toBe(false);
      expect(status.readyState).toBe(0); // 0 = disconnected in mongoose
    });
  });
});