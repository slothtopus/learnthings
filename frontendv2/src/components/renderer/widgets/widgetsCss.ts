export const widgetsCss = `
*, *::before, *::after { box-sizing: border-box; }

#root {
  width: 100%;
  height: 100%;
  font-family: Inter, system-ui, sans-serif;
  color: var(--color-on-surface, #e2e2e5);
}

.wgt-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 2px;
  border: 1px solid transparent;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
  user-select: none;
  white-space: nowrap;
}
.wgt-btn:hover { opacity: 0.85; }
.wgt-btn:active { transform: scale(0.97); }
.wgt-btn:disabled { opacity: 0.4; cursor: not-allowed; pointer-events: none; }

.wgt-btn-primary {
  background: var(--color-primary, #70d8c8);
  color: var(--color-on-primary, #0c0e10);
  border-color: var(--color-primary, #70d8c8);
}
.wgt-btn-danger {
  background: rgba(248, 113, 113, 0.12);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.3);
}
.wgt-btn-warning {
  background: rgba(251, 146, 60, 0.12);
  color: #fb923c;
  border-color: rgba(251, 146, 60, 0.3);
}
.wgt-btn-info {
  background: rgba(96, 165, 250, 0.12);
  color: #60a5fa;
  border-color: rgba(96, 165, 250, 0.3);
}

.wgt-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.25);
  color: var(--color-on-surface, #e2e2e5);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.wgt-input:focus {
  border-color: var(--color-primary, #70d8c8);
}
.wgt-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}
`
