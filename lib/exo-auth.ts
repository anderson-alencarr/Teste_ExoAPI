import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

export interface JwtPayload {
  email: string;
  jti: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

const globalForAuth = globalThis as unknown as {
  __exoJwtSecret?: Buffer;
};

function getJwtSecret(): Buffer {
  const envSecret = process.env.EXO_JWT_SECRET;
  if (envSecret && envSecret.trim().length >= 16) {
    return Buffer.from(envSecret.trim(), 'utf-8');
  }
  if (!globalForAuth.__exoJwtSecret) {
    globalForAuth.__exoJwtSecret = crypto.randomBytes(32);
  }
  return globalForAuth.__exoJwtSecret;
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : input;
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + '='.repeat(padLength), 'base64');
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  if (!salt || !keyHex) return false;

  const expectedBuf = Buffer.from(keyHex, 'hex');
  const actualBuf = crypto.scryptSync(password, salt, 64);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function signExoJwt(user: { id: number; email: string }): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload: JwtPayload = {
    email: user.email,
    jti: String(user.id),
    iss: 'exoapi.webapi',
    aud: 'exoapi.webapi',
    iat: nowSeconds,
    exp: nowSeconds + 30 * 60, // 30 minutes matching ExoApi tutorial
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest();

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

export function verifyExoJwt(token: string): JwtPayload | null {
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSig] = segments;
  if (!encodedHeader || !encodedPayload || !encodedSig) return null;

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = crypto
    .createHmac('sha256', getJwtSecret())
    .update(signingInput)
    .digest();

  let actualSig: Buffer;
  try {
    actualSig = base64UrlDecode(encodedSig);
  } catch {
    return null;
  }

  if (expectedSig.length !== actualSig.length) return null;
  if (!crypto.timingSafeEqual(expectedSig, actualSig)) return null;

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString('utf-8')) as {
      alg?: string;
    };
    if (header.alg !== 'HS256') return null;

    const payload = JSON.parse(
      base64UrlDecode(encodedPayload).toString('utf-8')
    ) as JwtPayload;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (
      payload.iss !== 'exoapi.webapi' ||
      payload.aud !== 'exoapi.webapi' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= nowSeconds
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function authenticateBearerRequest(req: NextRequest): JwtPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;

  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match || !match[1]) return null;

  return verifyExoJwt(match[1].trim());
}

function isAllowedOrigin(origin: string, req: NextRequest): boolean {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostHeader =
      req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    if (hostHeader && parsed.host === hostHeader) {
      return true;
    }

    const appUrl = process.env.APP_URL;
    if (appUrl && appUrl !== 'MY_APP_URL') {
      try {
        if (new URL(appUrl).origin === parsed.origin) return true;
      } catch {
        // Ignore invalid APP_URL
      }
    }

    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1'
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

export function buildCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin');
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    Vary: 'Origin',
  };

  if (origin && isAllowedOrigin(origin, req)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
}
