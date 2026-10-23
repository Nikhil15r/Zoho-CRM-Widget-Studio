import dns from 'node:dns/promises';
import { URL } from 'node:url';

// Private and restricted IP ranges to block SSRF
const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // Loopback 127.0.0.0/8
  /^10\./,                           // Private 10.0.0.0/8
  /^192\.168\./,                     // Private 192.168.0.0/16
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // Private 172.16.0.0/12
  /^169\.254\./,                     // Link-local 169.254.0.0/16
  /^0\./,                            // 0.0.0.0/8
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 unique local
  /^fe80:/i                          // IPv6 link local
];

export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; error?: string; parsedUrl?: URL }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }

  // Only allow HTTP/HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, error: `Disallowed protocol "${parsed.protocol}". Only http: and https: are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, internal domains, and metadata services
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'instance-data' ||
    hostname === '169.254.169.254'
  ) {
    return { safe: false, error: `Access to local or internal host "${hostname}" is blocked for security (SSRF prevention).` };
  }

  // Resolve DNS to verify the target IP is not private
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const addr of addresses) {
      for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(addr.address)) {
          return {
            safe: false,
            error: `Target resolved to restricted private IP address (${addr.address}). Request blocked (SSRF prevention).`
          };
        }
      }
    }
  } catch (dnsErr: any) {
    return { safe: false, error: `DNS resolution failed for host "${hostname}": ${dnsErr.message}` };
  }

  return { safe: true, parsedUrl: parsed };
}
