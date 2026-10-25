import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function ActivityTracker() {
  const { user, isAdmin, isNfcOperator, isImpersonating } = useAuth();
  const location = useLocation();

  const pendingRef = useRef(0);
  const lastInteractionRef = useRef(Date.now());
  const locationPathRef = useRef(location.pathname);
  const sessionIdRef = useRef('');

  useEffect(() => {
    locationPathRef.current = location.pathname;
  }, [location.pathname]);

  // Session ID initialization from sessionStorage or crypto.randomUUID
  useEffect(() => {
    let sid = sessionStorage.getItem('hx_sid');
    if (!sid) {
      sid = (typeof crypto !== 'undefined' && crypto.randomUUID) 
        ? crypto.randomUUID() 
        : 'sid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('hx_sid', sid);
    }
    sessionIdRef.current = sid;
  }, []);

  // Pageview tracking on pathname change
  useEffect(() => {
    if (!user || isAdmin || isNfcOperator || isImpersonating) return;
    if (!sessionIdRef.current) return;

    api.post('/analytics/pageview', {
      path: location.pathname,
      sessionId: sessionIdRef.current
    }).catch(() => {});
  }, [location.pathname, user, isAdmin, isNfcOperator, isImpersonating]);

  // Heartbeat & Activity listeners
  useEffect(() => {
    if (!user || isAdmin || isNfcOperator || isImpersonating) return;

    // Passive interaction listeners
    const handleInteraction = () => {
      lastInteractionRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(evt => window.addEventListener(evt, handleInteraction, { passive: true }));

    // 1-second active tracking interval
    const secondTimer = setInterval(() => {
      if (document.visibilityState === 'visible' && (Date.now() - lastInteractionRef.current < 60000)) {
        pendingRef.current += 1;
      }
    }, 1000);

    // 15-second heartbeat sender
    const heartbeatTimer = setInterval(() => {
      const pending = pendingRef.current;
      if (pending > 0) {
        const toSend = Math.min(pending, 30);
        api.post('/analytics/heartbeat', {
          sessionId: sessionIdRef.current,
          activeSec: toSend,
          path: locationPathRef.current
        }).catch(() => {});
        pendingRef.current -= toSend;
      }
    }, 15000);

    // Flush helper on hidden or pagehide
    const flushHeartbeat = () => {
      const pending = pendingRef.current;
      if (pending > 0 && sessionIdRef.current) {
        const toSend = Math.min(pending, 30);
        const token = localStorage.getItem('hx_token');
        if (token) {
          const body = JSON.stringify({
            sessionId: sessionIdRef.current,
            activeSec: toSend,
            path: locationPathRef.current
          });
          try {
            fetch('/api/analytics/heartbeat', {
              method: 'POST',
              keepalive: true,
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + token
              },
              body
            }).catch(() => {});
          } catch (_) {}
        }
        pendingRef.current = 0;
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flushHeartbeat);

    return () => {
      flushHeartbeat();
      clearInterval(secondTimer);
      clearInterval(heartbeatTimer);
      events.forEach(evt => window.removeEventListener(evt, handleInteraction));
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flushHeartbeat);
    };
  }, [user, isAdmin, isNfcOperator, isImpersonating]);

  return null;
}
