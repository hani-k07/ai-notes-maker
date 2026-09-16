import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../src/services/api';

global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches health status successfully', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'healthy', ollama: 'connected' }),
    });

    const health = await api.getHealth();
    expect(health.status).toBe('healthy');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/health'));
  });

  it('handles health check failure', async () => {
    fetch.mockResolvedValue({ ok: false });

    await expect(api.getHealth()).rejects.toThrow("Health check failed");
  });

  it('saves a note correctly', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, status: 'created' }),
    });

    const note = { title: 'Test', content: 'Content' };
    const result = await api.saveNote(note);
    expect(result.id).toBe(123);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/notes'), expect.objectContaining({
      method: 'POST'
    }));
  });
});
