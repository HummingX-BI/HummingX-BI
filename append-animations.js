const fs = require('fs');
let css = fs.readFileSync('css/components.css', 'utf8');

const animationStyles = `

/* ================================================================
   MARQUEE - Infinite horizontal scroll strip
   ================================================================ */
.marquee {
  overflow: hidden;
  position: relative;
  padding: 14px 0;
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  -webkit-mask-image: linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, black 80px, black calc(100% - 80px), transparent 100%);
}

.marquee__track {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: max-content;
  animation: marquee-scroll 28s linear infinite;
  will-change: transform;
}

.marquee__item {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: color var(--transition-fast);
}

.marquee:hover .marquee__item {
  color: var(--color-text-primary);
}

.marquee__sep {
  color: var(--color-gold);
  font-size: 0.5rem;
  line-height: 1;
}

@keyframes marquee-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none; }
}

/* ================================================================
   FAQ ACCORDION - Smooth height transition
   ================================================================ */
:root {
  --transition-normal: 350ms cubic-bezier(0.25, 1, 0.5, 1);
}

.faq-item.is-open {
  border-color: rgba(0, 229, 160, 0.25);
  box-shadow: 0 4px 16px rgba(0, 229, 160, 0.06);
}

/* ================================================================
   PROCESS STEPPER - Progress line on is-active
   ================================================================ */
.process-step {
  transition: opacity 0.4s ease;
}

.process-step:not(.is-active) {
  opacity: 0.45;
}

.process-step.is-active {
  opacity: 1 !important;
}

@media (min-width: 768px) {
  .process-step.is-active {
    position: relative;
  }

  .process-step.is-active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, var(--color-gold), rgba(0,229,160,0.3));
    transform-origin: left;
    animation: step-line-in 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
  }
}

@keyframes step-line-in {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

@media (prefers-reduced-motion: reduce) {
  .process-step,
  .process-step::after {
    animation: none !important;
    transition: none !important;
    opacity: 1 !important;
  }
}

/* ================================================================
   CARD HOVER - Consistent elevation
   ================================================================ */
.team-profile,
.project-card,
.solution-card,
.philosophy-card {
  transition:
    transform 200ms cubic-bezier(0.22,1,0.36,1),
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.team-profile:hover,
.project-card:hover,
.solution-card:hover,
.philosophy-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,229,160,0.15);
  border-color: rgba(0,229,160,0.3);
}

@media (prefers-reduced-motion: reduce) {
  .team-profile,
  .project-card,
  .solution-card,
  .philosophy-card {
    transition: none !important;
  }
  .team-profile:hover,
  .project-card:hover,
  .solution-card:hover,
  .philosophy-card:hover {
    transform: none !important;
  }
}

/* ================================================================
   CAROUSEL - Enhanced progress bar
   ================================================================ */
.carousel-progress {
  flex: 1;
  max-width: 120px;
  height: 2px;
  background: var(--color-border);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.carousel-progress-bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 8%;
  background: var(--color-gold);
  border-radius: 2px;
  transition: width 0.25s ease;
}

.carousel-btn {
  transition: opacity var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
}

.carousel-btn:hover {
  transform: scale(1.08);
}

.carousel-btn:active {
  transform: scale(0.95);
}
`;

fs.writeFileSync('css/components.css', css + animationStyles);
console.log('Animation CSS appended successfully. Total bytes:', (css + animationStyles).length);
