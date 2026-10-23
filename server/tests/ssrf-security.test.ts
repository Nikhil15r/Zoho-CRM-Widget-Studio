import { describe, it, expect } from 'vitest';
import { validateSafeUrl } from '../src/middleware/ssrf-filter.js';

describe('SSRF Protection Filter', () => {
  it('should block localhost and loopback targets', async () => {
    const res1 = await validateSafeUrl('http://localhost:8080/admin');
    expect(res1.safe).toBe(false);
    expect(res1.error).toContain('blocked for security');

    const res2 = await validateSafeUrl('http://127.0.0.1:3000/secret');
    expect(res2.safe).toBe(false);
  });

  it('should block AWS / cloud metadata endpoints', async () => {
    const res = await validateSafeUrl('http://169.254.169.254/latest/meta-data/');
    expect(res.safe).toBe(false);
  });

  it('should block non-http protocols (file://, ftp://, gopher://)', async () => {
    const res1 = await validateSafeUrl('file:///etc/passwd');
    expect(res1.safe).toBe(false);

    const res2 = await validateSafeUrl('ftp://example.com/file.txt');
    expect(res2.safe).toBe(false);
  });

  it('should allow valid public external URLs', async () => {
    const res = await validateSafeUrl('https://httpbin.org/get');
    expect(res.safe).toBe(true);
  });
});
