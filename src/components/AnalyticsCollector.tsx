'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * AnalyticsCollector — client-side pageview tracker.
 *
 * Fires a beacon to /api/drain/analytics on every route change.
 * Payload shape matches the Vercel drain format so the
 * AnalyticsEvent schema and MCP tools work without modification.
 *
 * Uses navigator.sendBeacon() for reliability — events are delivered
 * even if the user navigates away or closes the tab.
 */

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

function generateSessionId(): number {
  // Simple session ID — persists for the tab lifetime via sessionStorage
  if (typeof window === 'undefined') return 0;
  const key = '__bt_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = String(Math.floor(Math.random() * 2_147_483_647));
    sessionStorage.setItem(key, sid);
  }
  return Number(sid);
}

export default function AnalyticsCollector() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render — let it settle, then track
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Still track the initial pageview
    }

    const event = {
      eventType: 'pageview',
      path: pathname,
      timestamp: Date.now(),
      sessionId: generateSessionId(),
      device: getDeviceType(),
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : null,
      referrer: typeof document !== 'undefined' ? document.referrer || null : null,
    };

    // sendBeacon is fire-and-forget — survives page unloads
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/drain/analytics',
        new Blob([JSON.stringify(event)], { type: 'application/json' }),
      );
    } else {
      // Fallback for environments without sendBeacon
      fetch('/api/drain/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
        keepalive: true,
      }).catch(() => {
        // Silently fail — analytics should never break the user experience
      });
    }
  }, [pathname]);

  return null;
}
