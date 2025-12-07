/**
 * Health Check API Tests
 * Tests the health endpoint for monitoring functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import healthCheckHandler from '../../pages/api/health';

// Mock the database connection
jest.mock('@/lib/db/mongo', () => ({
  getDb: jest.fn(),
}));

// Create mock response object
const mockResponse = (): NextApiResponse & {
  json: jest.Mock;
  status: jest.Mock;
  setHeader: jest.Mock;
  end: jest.Mock;
} => ({
  json: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  end: jest.fn(),
});

describe('/api/health', () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {
      method: 'GET',
    } as NextApiRequest;
    res = mockResponse();

    // Reset mocks
    jest.clearAllMocks();
  });

  it('returns 405 for non-GET methods', async () => {
    req.method = 'POST';

    await healthCheckHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalled();
  });

  it('returns healthy status when database is up', async () => {
    // Mock database as up
    const mockDb = {
      command: jest.fn().mockResolvedValue({}),
    };

    const { getDb } = require('@/lib/db/mongo');
    getDb.mockResolvedValue(mockDb);

    // Mock setTimeout to resolve immediately for testing
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: Function) => {
      (cb as () => void)();
      return {} as NodeJS.Timeout;
    });

    // Mock environment
    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';
    process.env.npm_package_version = '1.0.0';

    await healthCheckHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store, no-cache, must-revalidate');

    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData.status).toBe('healthy');
    expect(responseData.version).toBe('1.0.0');
    expect(responseData.checks.database.status).toBe('up');
    expect(typeof responseData.uptime).toBe('number');
    expect(typeof responseData.checks.database.latency).toBe('number');
  });

  it('returns healthy status in demo mode', async () => {
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true';
    process.env.npm_package_version = '2.0.0';

    await healthCheckHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData.status).toBe('healthy');
    expect(responseData.version).toBe('2.0.0');
    expect(responseData.checks.database.status).toBe('up');
    expect(responseData.checks.database.latency).toBe(0);
  });

  it('returns unhealthy status when database is down', async () => {
    const { getDb } = require('@/lib/db/mongo');
    getDb.mockRejectedValue(new Error('Database connection failed'));

    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

    await healthCheckHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(503);

    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData.status).toBe('unhealthy');
    expect(responseData.checks.database.status).toBe('down');
    expect(responseData.checks.database.error).toContain('Database connection failed');
  });

  it('returns degraded status when database response is slow', async () => {
    const mockDb = {
      command: jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1500))
      ),
    };

    const { getDb } = require('@/lib/db/mongo');
    getDb.mockResolvedValue(mockDb);

    process.env.NEXT_PUBLIC_DEMO_MODE = 'false';

    await healthCheckHandler(req, res);

    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData.status).toBe('degraded');
    expect(responseData.checks.database.status).toBe('up');
    expect(responseData.checks.database.latency).toBeGreaterThan(1000);
  });

  it('includes timestamp in response', async () => {
    const { getDb } = require('@/lib/db/mongo');
    getDb.mockResolvedValue({
      command: jest.fn().mockResolvedValue({}),
    });

    await healthCheckHandler(req, res);

    const responseData = (res.json as jest.Mock).mock.calls[0][0];
    expect(responseData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
