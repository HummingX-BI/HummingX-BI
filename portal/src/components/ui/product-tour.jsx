"use client";

import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal } from "react-dom";

const SPRING = { type: "spring", stiffness: 320, damping: 32, mass: 0.7 };

export function Tour({
  steps,
  open,
  onOpenChange,
  index: controlledIndex,
  onIndexChange,
  onFinish,
  onSkip,
  showProgress = true,
  clickToNext = false,
  dark,
  className,
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [indexState, setIndexState] = useState(0);
  const index = controlledIndex ?? indexState;
  
  const setIndex = useCallback(
    (i) => {
      onIndexChange?.(i);
      setIndexState(i);
    },
    [onIndexChange],
  );

  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const [rect, setRect] = useState(null);
  const [cardSize, setCardSize] = useState({ w: 320, h: 168 });
  const [vp, setVp] = useState({ w: 1024, h: 768 });

  useEffect(() => setMounted(true), []);

  const step = steps[index];
  const count = steps.length;
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const pad = step?.padding ?? 8;

  const finish = useCallback(() => {
    onFinish?.();
    onOpenChange?.(false);
    setIndexState(0);
  }, [onFinish, onOpenChange]);

  const skip = useCallback(() => {
    onSkip?.();
    onOpenChange?.(false);
    setIndexState(0);
  }, [onSkip, onOpenChange]);

  const next = useCallback(() => {
    if (isLast) finish();
    else setIndex(index + 1);
  }, [isLast, finish, index, setIndex]);

  const back = useCallback(() => {
    if (!isFirst) setIndex(index - 1);
  }, [isFirst, index, setIndex]);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      setVp({ w: window.innerWidth, h: window.innerHeight });
      if (!step?.target || step?.target === 'body') {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.target);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    const el = (step?.target && step?.target !== 'body') ? document.querySelector(step.target) : null;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center", inline: "center" });

    measure();
    const settle = window.setTimeout(measure, reduce ? 0 : 320);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(settle);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, index, step, reduce]);

  useLayoutEffect(() => {
    if (cardRef.current) {
      const r = cardRef.current.getBoundingClientRect();
      setCardSize({ w: r.width, h: r.height });
    }
  }, [index, open, rect]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      } else if (e.key === "Tab") {
        const focusables = cardRef.current?.querySelectorAll(
          "button, [href], input, [tabindex]:not([tabindex='-1'])",
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, next, back, skip]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      cardRef.current?.querySelector("[data-tour-primary]")?.focus();
    }, 40);
    return () => window.clearTimeout(t);
  }, [open, index]);

  if (!mounted || !open || !step) return null;

  const isDark = dark ?? !!rootRef.current?.closest(".dark");

  const gap = 14;
  let place = step.placement ?? "auto";
  if (!rect) place = "center";
  if (place === "auto" && rect) {
    if (rect.top + rect.height + gap + cardSize.h < vp.h) place = "bottom";
    else if (rect.top - gap - cardSize.h > 0) place = "top";
    else if (rect.left + rect.width + gap + cardSize.w < vp.w) place = "right";
    else place = "left";
  }

  let left = vp.w / 2 - cardSize.w / 2;
  let top = vp.h / 2 - cardSize.h / 2;
  if (rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    if (place === "bottom") {
      left = cx - cardSize.w / 2;
      top = rect.top + rect.height + gap + pad;
    } else if (place === "top") {
      left = cx - cardSize.w / 2;
      top = rect.top - gap - pad - cardSize.h;
    } else if (place === "right") {
      left = rect.left + rect.width + gap + pad;
      top = cy - cardSize.h / 2;
    } else if (place === "left") {
      left = rect.left - gap - pad - cardSize.w;
      top = cy - cardSize.h / 2;
    }
  }
  left = Math.min(Math.max(12, left), vp.w - 12 - cardSize.w);
  top = Math.min(Math.max(12, top), vp.h - 12 - cardSize.h);

  const spot = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  const overlayInk = isDark ? "rgba(4,4,6,0.62)" : "rgba(17,17,20,0.48)";

  return createPortal(
    <div ref={rootRef} className={`${isDark ? "dark" : ""} ${className ?? ""}`} style={{ zIndex: 9999, position: 'relative' }}>
      <AnimatePresence>
        <motion.div
          key="tour-layer"
          className="fixed inset-0"
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          aria-hidden={false}
          role="dialog"
          aria-modal="true"
          aria-label={typeof step.title === "string" ? step.title : "Product tour"}
        >
          <div className="absolute inset-0" style={{ position: 'absolute', inset: 0 }} onClick={() => clickToNext && next()} />

          {spot ? (
            <motion.div
              className="pointer-events-none absolute rounded-xl"
              initial={false}
              animate={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
              transition={reduce ? { duration: 0 } : SPRING}
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                borderRadius: '12px',
                boxShadow: `0 0 0 9999px ${overlayInk}`,
                outline: isDark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.85)",
                outlineOffset: 2,
              }}
            >
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  position: 'absolute', inset: 0, borderRadius: '12px',
                  boxShadow: isDark
                    ? "0 0 0 1px rgba(255,255,255,0.22), 0 8px 40px rgba(0,0,0,0.5)"
                    : "0 0 0 1px rgba(0,0,0,0.06), 0 8px 40px rgba(0,0,0,0.18)",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: overlayInk }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          <motion.div
            ref={cardRef}
            className="absolute"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1, left, top }}
            transition={reduce ? { duration: 0 } : SPRING}
            style={{ 
              position: 'absolute', left, top, width: '320px', maxWidth: 'calc(100vw - 24px)', 
              borderRadius: '16px', border: '1px solid #E5E7EB', background: '#FFFFFF', padding: '16px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: 0 }}>
                {step.title}
              </h3>
              <button
                type="button"
                onClick={skip}
                aria-label="Close tour"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', color: '#9CA3AF' }}
              >
                <IconX />
              </button>
            </div>

            <div style={{ marginTop: '8px', fontSize: '13px', lineHeight: 1.6, color: '#6B7280' }}>
              {step.content}
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              {showProgress ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} aria-hidden>
                  {steps.map((_, i) => (
                    <span
                      key={i}
                      style={{ 
                        height: '6px', borderRadius: '9999px', transition: 'all 300ms', 
                        backgroundColor: i === index ? '#111827' : '#E5E7EB', 
                        width: i === index ? '16px' : '6px' 
                      }}
                    />
                  ))}
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
                  {index + 1} / {count}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {!isFirst && (
                  <button
                    type="button"
                    onClick={back}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500, color: '#6B7280', padding: '6px 10px', borderRadius: '8px' }}
                  >
                    <IconArrow style={{ transform: 'rotate(180deg)' }} />
                    Atrás
                  </button>
                )}
                <button
                  type="button"
                  data-tour-primary
                  onClick={next}
                  style={{ background: '#111827', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600 }}
                >
                  {isLast ? "Hecho" : "Siguiente"}
                  {!isLast && <IconArrow />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body,
  );
}

export function useTour(storageKey) {
  const [open, setOpenState] = useState(() => {
    return sessionStorage.getItem('tour_open') === 'true';
  });
  const [index, setIndexState] = useState(() => {
    return parseInt(sessionStorage.getItem('tour_index') || '0', 10);
  });

  const setOpen = useCallback((val) => {
    setOpenState(val);
    sessionStorage.setItem('tour_open', val);
  }, []);

  const setIndex = useCallback((val) => {
    setIndexState(val);
    sessionStorage.setItem('tour_index', val);
  }, []);

  const seen = useCallback(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }, [storageKey]);

  const start = useCallback(() => {
    setIndex(0);
    setOpen(true);
  }, [setIndex, setOpen]);

  const markSeen = useCallback(() => {
    setOpen(false);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      return;
    }
  }, [storageKey, setOpen]);

  return { open, setOpen, index, setIndex, start, seen, markSeen };
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: '16px', height: '16px' }}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconArrow({ style = {} }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', ...style }}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
