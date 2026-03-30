# GRAVITY LIGHT THEME - TOKEN MAPPING DOCUMENT

> **Purpose:** Exhaustive implementation blueprint for the light mode redesign.
> **Status:** MAPPING ONLY - no code changes. Actual color values marked as `NEW_VALUE` until Color Harmony phase delivers the palette.
> **Date:** 2026-03-30

---

## Section A: Canonical Token Changes (tokens.css `body.light-theme`)

These tokens already exist in the `body.light-theme` block at `nucleo-global/Tokens/tokens.css` lines 147-160. Each entry documents whether the current value is correct or needs revision.

| # | Token | BEFORE (current light value) | AFTER | Reason |
|---|-------|------------------------------|-------|--------|
| A1 | `--bg-body` | `#f8fafc` | `NEW_VALUE` | Evaluate if slate-50 is the right body tone or if it needs to be warmer/cooler |
| A2 | `--bg-base` | `#ffffff` | `NEW_VALUE` | Pure white may be too harsh; consider off-white |
| A3 | `--bg-surface` | `#f1f5f9` | `NEW_VALUE` | Surface cards on light bg need sufficient contrast against bg-base |
| A4 | `--bg-elevated` | `#e2e8f0` | `NEW_VALUE` | Used as border-default alias; must be visible against bg-surface |
| A5 | `--text-primary` | `#0f172a` | `NEW_VALUE` | Near-black; verify WCAG AAA against bg-base |
| A6 | `--text-secondary` | `#475569` | `NEW_VALUE` | Must pass WCAG AA (4.5:1) against bg-base and bg-surface |
| A7 | `--text-muted` | `#94a3b8` | `NEW_VALUE` | Currently fails WCAG AA on white (3.03:1). Needs darker value |
| A8 | `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1)` | `NEW_VALUE` | Shadows need less opacity on light backgrounds |
| A9 | `--shadow-md` | `0 4px 12px rgba(0,0,0,0.15)` | `NEW_VALUE` | Review shadow intensity |
| A10 | `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.2)` | `NEW_VALUE` | Review shadow intensity |

---

## Section B: Tokens to ADD to `body.light-theme` (Currently Missing)

These tokens are defined in `:root` (dark mode) but have NO override in `body.light-theme`. In light mode, the dark-mode values bleed through, causing visual breakage.

| # | Token | Current dark value (visible in light mode) | New light value needed | Reason |
|---|-------|---------------------------------------------|------------------------|--------|
| B1 | `--accent` | `#818cf8` (Violet 400) | `NEW_VALUE` | Violet 400 has poor contrast on white (3.08:1 - fails AA). Need a darker accent for light mode, e.g., Indigo 600 `#4f46e5` or similar |
| B2 | `--accent-hover` | `#6366f1` (tokens.css) / `#4f46e5` (shell.css) -- **INCONSISTENT** | `NEW_VALUE` | Must be darker than accent in light mode. Also fixes the inconsistency between tokens.css and shell.css |
| B3 | `--accent-dim` | `rgba(129, 140, 248, 0.12)` | `NEW_VALUE` | On white bg, 12% opacity violet is nearly invisible. Needs higher opacity or adjusted base color |
| B4 | `--accent-soft` | `rgba(129, 140, 248, 0.15)` | `NEW_VALUE` | Same issue as accent-dim; too faint on white |
| B5 | `--success-soft` | `rgba(34, 197, 94, 0.15)` | `NEW_VALUE` | Green at 15% on white is very faint; adjust opacity or use opaque light green |
| B6 | `--warning-soft` | `rgba(245, 158, 11, 0.15)` | `NEW_VALUE` | Same; amber at 15% on white barely visible |
| B7 | `--danger-soft` | `rgba(239, 68, 68, 0.15)` | `NEW_VALUE` | Red at 15% on white too faint |
| B8 | `--border-default` | `var(--bg-elevated)` | `NEW_VALUE` | May need a dedicated opaque border color (not just elevated bg) for more visible borders in light mode |
| B9 | `--border-accent` | `rgba(129, 140, 248, 0.20)` | `NEW_VALUE` | Nearly invisible on white at 20% opacity |
| B10 | `--focus-ring` | `0 0 0 2px rgba(129, 140, 248, 0.4)` | `NEW_VALUE` | Ring color may need adjustment if accent changes |
| B11 | `--success` | `#22c55e` | `NEW_VALUE` | Green-500 on white bg may need darkening for text usage (contrast 3.5:1 on white) |
| B12 | `--warning` | `#f59e0b` | `NEW_VALUE` | Amber-500 on white has poor contrast (2.15:1). Needs darker amber for light mode |
| B13 | `--danger` | `#ef4444` | `NEW_VALUE` | Red-500 on white has borderline contrast (4.0:1). May need slight darkening |
| B14 | `--transition-fast` | `0.15s ease` | No change needed | Does not vary by theme |
| B15 | `--transition-normal` | `0.2s ease` | No change needed | Does not vary by theme |

**CRITICAL NOTE on B1-B2:** The design system skill says `--accent: #6366f1` (Indigo 500) and `--accent-hover: #4f46e5`, but `tokens.css` defines `--accent: #818cf8` (Violet 400) and `--accent-hover: #6366f1`. Shell.css also defines `--accent: #6366f1` and `--accent-hover: #4f46e5`. This inconsistency must be resolved as part of this work.

---

## Section C: Shell / Marketplace / Workspace Token Sync

### C1. `servicos-global/shell/shell.css` (lines 10-60)

**Problem:** Shell defines its own `:root` tokens AND its own `body.light-theme` block. These are out of sync with canonical tokens.css.

| Issue | Detail | Fix Required |
|-------|--------|-------------|
| Duplicate `:root` tokens | Shell re-declares `--bg-body-dark`, `--bg-base`, etc. but uses `--bg-body-dark` instead of canonical `--bg-body` | Long-term: remove duplicates. Short-term: ensure light overrides match canonical |
| `--accent` value mismatch | Shell: `#6366f1` vs tokens.css: `#818cf8` | Align to canonical value |
| `--accent-hover` mismatch | Shell: `#4f46e5` vs tokens.css: `#6366f1` | Align to canonical value |
| `--focus-ring` mismatch | Shell: `0 0 0 2px #818cf8` (opaque) vs tokens.css: `rgba(129,140,248,0.4)` (transparent) | Align to canonical value |
| Missing light overrides | Shell `body.light-theme` does NOT override: `--accent`, `--accent-hover`, `--focus-ring`, `--shadow-sm`, `--shadow-md`, `--info` | Add all missing overrides |
| No `--shadow-lg` at all | Shell defines no `--shadow-lg` | Add if needed |

**Token additions needed in shell.css `body.light-theme`:**
```
--accent:        NEW_VALUE;
--accent-hover:  NEW_VALUE;
--focus-ring:    NEW_VALUE;
--shadow-sm:     NEW_VALUE;
--shadow-md:     NEW_VALUE;
```

### C2. `servicos-global/marketplace/src/styles/tokens.css` (lines 6-68)

**Problem:** Marketplace has its own token set with different naming (uses `--accent-10`, `--accent-20` instead of `--accent-dim`, `--accent-soft`).

| Issue | Detail | Fix Required |
|-------|--------|-------------|
| Different accent naming | `--accent-10`, `--accent-20` vs canonical `--accent-dim`, `--accent-soft` | Either align names or ensure both have light overrides |
| `--accent` value matches shell not tokens | `#6366f1` | Align to canonical |
| Missing light overrides | No overrides for `--accent`, `--accent-hover`, `--accent-10`, `--accent-20`, `--gradient-accent`, `--gradient-hero` | Add overrides |
| `--gradient-hero` | `linear-gradient(180deg, #0f172a 0%, #1e293b 100%)` | Needs light version (light-to-lighter gradient) |
| `--gradient-accent` | `linear-gradient(135deg, #818cf8 0%, #818cf8 100%)` | May need adjusted accent color for light |

**Token additions needed in marketplace tokens.css `body.light-theme`:**
```
--accent:         NEW_VALUE;
--accent-hover:   NEW_VALUE;
--accent-10:      NEW_VALUE;
--accent-20:      NEW_VALUE;
--gradient-hero:  NEW_VALUE;
--gradient-accent: NEW_VALUE;
```

### C3. `servicos-global/configurador/src/pages/workspace/workspace.css` (lines 8-34)

**Status:** Workspace already has a decent `body.light-theme` block (lines 26-34) that overrides `--ws-*` tokens. These are largely in sync since the canonical `tokens.css` aliases map `--ws-*` to `--bg-*` / `--text-*`.

| Issue | Detail | Fix Required |
|-------|--------|-------------|
| `--ws-accent` NOT overridden | Still `#818cf8` in light mode | Add `--ws-accent: NEW_VALUE` if accent changes for light |
| `--ws-accent-dim` adjusted | `rgba(129,140,248,0.10)` in light (0.12 in dark) | May need further adjustment based on final palette |
| `--ws-accent-border` adjusted | `rgba(129,140,248,0.25)` in light | Verify against final palette |
| Hardcoded `#ffffff` / `#0f172a` in component overrides | Lines 70-71: `background: #ffffff; color: #0f172a` in select option | Replace with var(--ws-surface) / var(--ws-text) |

---

## Section D: Component-Level Overrides Needed

### D1. `servicos-global/shell/shell.css` -- Shell forced globals

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.ws-global-user` (line 510) | `background: rgba(15, 23, 42, 0.85) !important` | Dark glassmorphism on light bg = black blob | `body.light-theme .ws-global-user { background: rgba(255, 255, 255, 0.85) !important }` or `var(--bg-surface)` | YES (dark uses `!important`) |
| `.ws-global-user:hover` (line 516) | `background: rgba(129, 140, 248, 0.08) !important` | Fine but verify visibility | Keep or adjust opacity | YES |
| `.ws-global-badge` (line 563) | `box-shadow: 0 0 0 2px #0f172a !important` | Dark ring visible on dark bg, invisible on light | `body.light-theme .ws-global-badge { box-shadow: 0 0 0 2px var(--bg-body) !important }` or `#f8fafc` | YES |
| `.mlg-submenu-item:hover` (line 583) | `background: rgba(255, 255, 255, 0.03) !important` | White-on-white = invisible hover | `body.light-theme .mlg-submenu-item:hover { background: rgba(0, 0, 0, 0.04) !important }` | YES |

### D2. `nucleo-global/Campos/campo-select-global/src/select.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.sg-dropdown` (line 217) | `background: rgba(22, 34, 56, 0.92)` | Dark glassmorphism dropdown on light page | `body.light-theme .sg-dropdown { background: rgba(255, 255, 255, 0.95) }` with appropriate border | No |
| `.sg-dropdown` border (line 220) | `border: 1.5px solid rgba(129,140,248,.25)` | May need stronger border on light | Adjust opacity or use `var(--border-default)` | No |
| `.sg-dropdown` shadow (line 222) | `--_sg-shadow` with heavy dark values | Too dark for light mode | Lighter shadow values | No |
| `.sg-campo` (line 36) | `background: var(--ws-bg-body, #0f172a)` | Fallback is dark | Fallback already handled by ws-bg-body override; verify | No |
| `.sg-busca-wrapper` (line 250) | `background: rgba(129,140,248,.04)` | Nearly invisible on white | Increase opacity for light | No |
| `.sg-opcao:hover` (line 368) | `background: rgba(255,255,255,.05)` | White-on-white | Already has light override at line 373 (`rgba(0,0,0,.05)`) | No |
| `.sg-check-box` (line 416) | `border: 1.5px solid rgba(255,255,255,.18)` | White border invisible on white bg | Already has light override at line 427 (`rgba(0,0,0,.25)`) | No |
| `.sg-lista` scrollbar (line 300) | `scrollbar-color: rgba(255,255,255,.1)` | White scrollbar on white | Already has light override at line 318 | No |
| `.sg-btn-limpar:hover` (line 176) | `background: rgba(255,255,255,.07)` | White on white | Already has light override at line 181 | No |
| `.sg-chip` (line 126) | `border: 1px solid rgba(129,140,248,.25)` | May be too faint on white | Increase opacity in light override | No |

### D3. `nucleo-global/Feedback/tooltip-global/src/tooltip.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.tg-card` (line 59) | `background: #0f172a` | **Hardcoded dark background** - tooltip shows as dark card in light mode | `body.light-theme .tg-card { background: var(--bg-base); border-color: var(--border-default) }` | No |
| `.tg-card` border (line 60) | `border: 1px solid rgba(129, 140, 248, 0.22)` | May need adjustment | Use `var(--border-default)` or `var(--border-accent)` | No |
| `.tg-card` shadow (line 63) | `box-shadow: 0 12px 32px rgba(0,0,0,0.6)` | Too heavy for light mode | `body.light-theme .tg-card { box-shadow: var(--shadow-lg) }` | No |
| `.tg-titulo` (line 84) | `color: #f1f5f9` | **Hardcoded light text** | `body.light-theme .tg-titulo { color: var(--text-primary) }` | No |
| `.tg-descricao` (line 92) | `color: #94a3b8` | **Hardcoded muted text** | `body.light-theme .tg-descricao { color: var(--text-secondary) }` | No |

**Design decision needed:** Should tooltips remain dark (inverted) in light mode for contrast? Many design systems keep tooltips dark regardless of theme. If so, no changes needed here. If tooltips should match the theme, all above applies.

### D4. `nucleo-global/Campos/switch-global/src/switch.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.sg-root` (line 24) | `background: rgba(255, 255, 255, 0.1)` | White transparency on white bg = invisible track | `body.light-theme .sg-root { background: rgba(0, 0, 0, 0.1) }` | No |
| `.sg-root:hover` (line 36) | `background: rgba(255, 255, 255, 0.15)` | Same issue | `body.light-theme .sg-root:hover { background: rgba(0, 0, 0, 0.15) }` | No |
| `.sg-root--checked` (line 40) | `background: #818cf8` | Hardcoded accent | Replace with `var(--accent)` and it will auto-resolve | No |
| `.sg-root:focus-visible` (line 62) | `box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5)` | May need adjustment | Use `var(--focus-ring)` | No |
| `.sg-label` (line 16) | `color: var(--ws-text, #f1f5f9)` | Fallback is light text; will resolve if --ws-text overridden | Verify cascade | No |

### D5. `nucleo-global/Login/login-global/src/login-global.css`

**ENTIRE FILE is hardcoded dark.** No `body.light-theme` overrides exist. This is the most problematic component.

| Selector | Current Value | Problem | Override Should Reference |
|----------|---------------|---------|---------------------------|
| `.login-global-panel` (line 9) | `background: rgba(30, 41, 59, 0.6)` | Dark glassmorphism | `var(--bg-surface)` or light glassmorphism |
| `.login-global-title` (line 24) | `color: #f1f5f9` | Hardcoded light text | `var(--text-primary)` |
| `.login-global-subtitle` (line 30) | `color: #94a3b8` | Hardcoded muted | `var(--text-secondary)` |
| `.login-global-footer` (line 39) | `color: #475569` | Hardcoded | `var(--text-muted)` |
| `.login-global-footer a` (line 43) | `color: #818cf8` | Hardcoded accent | `var(--accent)` |
| `.cl-formFieldInput` (lines 76-84) | `background: var(--bg-base, #1e293b) !important; color: #f1f5f9 !important; border: rgba(255,255,255,0.12) !important` | All hardcoded dark | Need full `body.light-theme` override block |
| `.cl-formFieldLabel` (line 97) | `color: #94a3b8 !important` | Hardcoded | `var(--text-secondary) !important` |
| `.cl-card` (line 107) | Heavy dark shadows | Dark mode styling | Lighter shadows for light mode |
| `.forgot-title` (line 199) | `color: #ffffff` | White text | `var(--text-primary)` |
| `.forgot-desc` (line 205) | `color: #94a3b8` | Hardcoded | `var(--text-secondary)` |
| `.forgot-field label` (line 226) | `color: #94a3b8` | Hardcoded | `var(--text-secondary)` |
| `.forgot-input-wrapper input` (line 248) | `background: rgba(15, 23, 42, 0.6); color: #f1f5f9; border: rgba(255,255,255,0.1)` | All dark | Full override needed |
| `.forgot-input-wrapper input:focus` (line 257) | `border-color: #6366f1; background: rgba(15, 23, 42, 0.8)` | Dark | Override bg and keep accent border |
| `.forgot-button` (line 269) | `background: #6366f1; color: white` | Works for both themes | Verify accent contrast |
| `.forgot-error-msg` (line 302) | `color: #fca5a5` | Pastel red for dark bg; needs darker red for light | `var(--danger)` |
| `.forgot-back-link` (line 313) | `color: #94a3b8` | Hardcoded | `var(--text-secondary)` |
| `.forgot-back-link:hover` (line 324) | `color: #f1f5f9` | Hardcoded | `var(--text-primary)` |
| `.login-footer-main` (line 137) | `color: #94a3b8` | Hardcoded | `var(--text-secondary)` |
| `.login-footer-secondary` (line 142) | `color: #475569` | Hardcoded | `var(--text-muted)` |
| `.forgot-input-icon` (line 241) | `color: #64748b` | Hardcoded | `var(--text-muted)` |

### D6. `nucleo-global/Layout/usuario-global/src/usuario-global.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.ws-global-user` (line 12) | `background: rgba(15, 23, 42, 0.82) !important` | Dark glassmorphism | `body.light-theme .ws-global-user { background: rgba(255, 255, 255, 0.9) !important }` | YES |
| `.ws-global-user` border (line 13) | `border: 1px solid rgba(129, 140, 248, 0.15)` | May be too faint on light | Increase opacity | No |
| `.ws-profile-dropdown` shadow (line 98) | `box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3)` | Acceptable but could be lighter | `var(--shadow-lg)` | No |
| `.ws-profile-avatar-lg` (line 121) | `color: #0f172a` | Works if accent bg stays | Verify | No |
| `.ws-profile-item--admin` (line 222) | `background: rgba(34, 197, 94, 0.05)` | Very faint on white | Increase opacity | No |
| `.ws-profile-item--configurador` (line 227) | `background: rgba(129, 140, 248, 0.05)` | Very faint on white | Increase opacity | No |

### D7. `nucleo-global/Layout/pagina-global/src/pagina-global.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `body.light-theme .pg-contexto-row` (line 49) | `background: var(--ws-bg-body, #0f172a)` | **WRONG FALLBACK** - falls back to dark `#0f172a` if `--ws-bg-body` not set | Change fallback to `#f8fafc` | No |
| `.pg-toolbar-wrapper` (line 78) | `background: var(--ws-bg-body, #0f172a)` | Same fallback issue in dark mode | Light override at line 92 has correct fallback `#f8fafc` | No |
| `.pg-contexto-row` (line 33) | `background: var(--ws-bg-body, #0f172a)` | Dark fallback | Already overridden for light at line 49 but with wrong fallback | No |

### D8. `servicos-global/configurador/src/pages/hub-store.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.hs-store-hero` (line 78) | `background: linear-gradient(135deg, var(--color-surface) 0%, rgba(15, 23, 42, 0.8) 100%)` | Dark gradient endpoint hardcoded | `body.light-theme` override with light gradient | No |
| `.hs-store-hero::after` (line 96) | `rgba(79, 70, 229, 0.15)` | Glow effect; may work on light | Verify | No |
| `.hs-glass-badge` (line 352) | `background: rgba(30, 41, 59, 0.6); border: rgba(255,255,255,0.08)` | Dark glassmorphism | Override for light: `rgba(255,255,255,0.8)` | No |
| `.hs-glass-badge:hover` (line 367) | `background: rgba(51, 65, 85, 0.6)` | Dark | Override | No |
| `.hs-glass-menu` (line 394) | `background: rgba(15, 23, 42, 0.85)` | Dark glassmorphism menu | Light override needed | No |
| `.hs-glass-btn-danger` (line 442) | `background: rgba(15, 23, 42, 0.4)` | Dark | Override | No |
| `.hs-product-card-premium` (line 473) | `background: rgba(255, 255, 255, 0.05)` | White-on-white | Override with `rgba(0,0,0,0.03)` or token | No |
| `.hs-product-card-bg` (line 488) | `background: var(--color-bg)` | OK if token overridden | Verify | No |
| `.hs-product-card-glow` (line 497) | `rgba(99, 102, 241, 0.3)` | Glow works on both | OK | No |
| `.hs-empty-state` (line 639) | `background: rgba(30, 41, 59, 0.3)` | Dark | Override for light | No |
| `.hs-icon-box-glass` (line 529) | `background: rgba(255,255,255,0.03); border: rgba(255,255,255,0.06)` | Invisible on white | Override | No |
| `.hs-gradient-text-subtle` (line 344) | `background: linear-gradient(180deg, #FFFFFF 0%, #cbd5e1 100%)` | White text gradient on dark; invisible on light | Override with dark gradient on light bg | No |
| `.hs-product-card-info h3` (line 586) | `color: #fff` | White text | `var(--text-primary)` | No |
| `.hs-badge-title` (line 377) | `color: #fff` | White text | `var(--text-primary)` | No |
| `.hs-product-card-footer span` (line 614) | `color: #fff` | White text | `var(--text-primary)` | No |
| `.hs-product-arrow` (line 621) | `background: rgba(255,255,255,0.05); color: #fff` | Invisible on white | Override | No |
| `.hs-empty-icon-wrap` (line 650) | `background: rgba(255,255,255,0.02); border: rgba(255,255,255,0.05); color: rgba(255,255,255,0.2)` | All invisible on white | Override | No |
| `.hs-empty-state h3` (line 663) | `color: #fff` | White text | `var(--text-primary)` | No |
| `.hs-store-card__footer` (line 141) | `background: rgba(255,255,255,0.02)` | Invisible on white | Override with subtle gray | No |
| `.hs-store-card:hover` (line 126) | `rgba(79, 70, 229, 0.5)` border and heavy dark shadows | May need lighter shadows | Override shadows | No |
| `.hs-product-card:hover` (line 72) | `box-shadow: 0 8px 24px rgba(0,0,0,0.3)` | Heavy shadow | Lighten | No |

### D9. `servicos-global/tenant/atividades/src/atividades.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.ativ-filters` (line 55) | `background: rgba(30, 41, 59, 0.85)` | Dark glassmorphism | `body.light-theme .ativ-filters { background: var(--bg-surface) }` | No |
| `.ativ-search-wrap` (line 74) | `background: rgba(15,23,42,0.6)` | Dark | Override | No |
| `.ativ-select` (line 94) | `background: rgba(15,23,42,0.6)` | Dark | Override | No |
| `.ativ-date-range input[type=date]` (line 115) | `background: rgba(15,23,42,0.6)` | Dark | Override | No |
| `.ativ-view-toggle` (line 146) | `background: rgba(255,255,255,0.05)` | White-on-white | Override with `rgba(0,0,0,0.04)` | No |
| `.ativ-view-btn:hover` (line 166) | `background: rgba(255,255,255,0.06)` | White-on-white | Override | No |
| `.ativ-kanban-col` (line 185) | `background: rgba(30,41,59,0.7)` | Dark | Override with `var(--bg-surface)` | No |
| `.ativ-kanban-col__header` (line 196) | `border-bottom: 1px solid rgba(255,255,255,0.06)` | Invisible on white | Override with `var(--border-default)` | No |
| `.ativ-card` (line 230) | `background: rgba(255,255,255,0.04)` | White-on-white | Override | No |
| `.ativ-card:hover` (line 240) | `background: rgba(255,255,255,0.08)` | White-on-white | Override | No |
| `.ativ-card__footer` (line 275) | `border-top: 1px solid rgba(255,255,255,0.05)` | Invisible on white | Override | No |
| `.ativ-table th` (line 326) | `background: rgba(15,23,42,0.8)` | Dark | Override | No |
| `.ativ-table td` (line 342) | `border-bottom: 1px solid rgba(255,255,255,0.04)` | Invisible on white | Override | No |
| `.ativ-table-wrap` (line 314) | `background: rgba(30,41,59,0.7)` | Dark | Override | No |
| `.ativ-field input, select, textarea` (line 502) | `background: rgba(15,23,42,0.6)` | Dark | Override with `var(--bg-body)` or `var(--bg-surface)` | No |
| `.ativ-sessoes-table td` (line 577) | `border-bottom: 1px solid rgba(255,255,255,0.04)` | Invisible | Override | No |

### D10. `nucleo-global/Botoes/botao-global/src/botao.css`

| Selector | Current Value | Problem | Override Should Reference | Needs `!important` |
|----------|---------------|---------|---------------------------|---------------------|
| `.gb-btn--perigo` (line 157) | `color: #fca5a5` | Pastel red text designed for dark bg; too light on white | `body.light-theme .gb-btn--perigo { color: var(--danger) }` | No |
| `.gb-btn--perigo:hover` (line 164) | `color: #fecaca` | Even lighter pastel | Override with `var(--danger)` | No |
| `.gb-btn--perigo .gb-btn__icon-badge` (line 168) | `color: #f87171` | Acceptable on white | May keep | No |
| `.gb-btn--secundario` (line 117) | `background: var(--color-surface-2, rgba(255,255,255,0.06))` | White-on-white fallback | Token cascade should fix; verify | No |
| `.gb-btn--secundario .gb-btn__icon-badge` (line 127) | `background: rgba(255,255,255,0.08)` | Invisible on white | Override with `rgba(0,0,0,0.06)` | No |
| `.gb-btn--fantasma` (line 135) | `border-color: var(--color-border, rgba(255,255,255,0.1))` | White border on white | Token cascade should fix | No |
| `.gb-btn--fantasma .gb-btn__icon-badge` (line 144) | `background: rgba(255,255,255,0.06)` | White-on-white | Override | No |
| `.gb-btn--fantasma:hover .gb-btn__icon-badge` (line 149) | `background: rgba(129,140,248,0.1)` | OK | No change | No |

### D11. `nucleo-global/Layout/card-global/src/card.css` & `card-premium.css`

Both files are identical (duplicate content). No `body.light-theme` overrides exist.

| Selector | Current Value | Problem | Override Should Reference |
|----------|---------------|---------|---------------------------|
| `.cg-card` | `background: var(--ws-surface, #1e293b)` | Fallback is dark; token cascade should handle | Verify `--ws-surface` is overridden |
| `.cg-card:hover` shadow | `0 10px 15px -3px rgba(0, 0, 0, 0.2)` | Acceptable for light | May want lighter |
| `.cg-period-picker` shadow | `0 16px 40px rgba(0, 0, 0, 0.55)` | Too heavy for light mode | Override |
| `.cg-card__tooltip` shadow | `0 16px 40px rgba(0, 0, 0, 0.55)` | Too heavy for light mode | Override |

### D12. `nucleo-global/Layout/card-global/src/stat-card.css`

Same structure as card.css. No `body.light-theme` overrides.

| Selector | Current Value | Problem | Override |
|----------|---------------|---------|---------|
| `.scg-card` | `background: var(--ws-surface, #1e293b)` | Token cascade should handle | Verify |
| `.scg-card:hover` shadow | Same heavy shadows | Lighten for light mode | Override |

### D13. `nucleo-global/Campos/campo-geral-global/src/campo-geral.css`

No `body.light-theme` overrides. Uses token vars throughout but:

| Selector | Current Value | Problem | Override |
|----------|---------------|---------|---------|
| `.cg-obrigatorio` (line 28) | `color: #f87171` | Hardcoded red; acceptable on both themes | No change |
| `.cg-erro` (line 42) | `color: #f87171` | Same | No change |
| `.cg-wrapper--erro` (line 50) | `border-color: #f87171` | Same | No change |
| Overall | All labels use `var(--ws-muted)` or `var(--text-muted)` | Token cascade handles it | Verify |

### D14. `nucleo-global/Layout/menu-lateral-global/src/menu-lateral.css`

| Selector | Current Value | Problem | Override |
|----------|---------------|---------|---------|
| `.mlg-sidebar` (line 18) | `background: linear-gradient(180deg, var(--mlg-accent-dim) 0%, var(--ws-surface) 120px)` | Gradient uses accent-dim which is dark-tuned | Override gradient for light mode |
| `.mlg-tenant-wrapper` (line 121) | `background: rgba(0, 0, 0, 0.05)` | Works on both | OK |
| `.mlg-submenu-item:hover` (line 306) | `background: rgba(255, 255, 255, 0.03)` | White-on-white | Override with `rgba(0,0,0,0.04)` |
| `.mlg-toggle-btn` shadow (line 57) | `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25)` | Acceptable | May lighten |
| `.mlg-toggle-btn:hover` (line 65) | `box-shadow: 0 2px 12px rgba(129, 140, 248, 0.4)` | OK | No change |

### D15. `nucleo-global/Tabelas/tabela-global/src/tabela.css`

| Selector | Current Value | Problem | Override |
|----------|---------------|---------|---------|
| `.tg-filtro-select option` (line 269) | `background: #1e293b` | **Hardcoded dark** for native select option | `body.light-theme .tg-filtro-select option { background: #ffffff }` |
| `.tg-tr-filho` (line 636) | `background: rgba(15, 23, 42, 0.35)` | Dark child row bg | Override with light equivalent |
| `.tg-tr-filho:hover` (line 639) | `background: rgba(129, 140, 248, 0.05)` | OK | No change |
| `.tg-tr` (line 365) | `border-bottom: 1px solid rgba(129, 140, 248, 0.06)` | Very faint on white | Increase opacity |
| `.tg-td--filho-first` (line 676) | `border-left: 2px solid rgba(129, 140, 248, 0.22) !important` | May be faint | Increase opacity | YES |
| Various `rgba(129, 140, 248, 0.*)` backgrounds | Filter, selection, pagination | Low opacity on white | Increase opacity values for light mode |

### D16. `nucleo-global/Tabelas/tabela-global/src/componentes/visibilidade.css`

| Selector | Current Value | Problem | Override |
|----------|---------------|---------|---------|
| `.vcg-popover` (line 8) | `box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6)` | Very heavy | Lighten for light mode |
| `.vcg-title` (line 33) | `color: #64748b` | Hardcoded | `var(--text-muted)` |
| `.vcg-close-btn` (line 38) | `color: #64748b` | Hardcoded | `var(--text-muted)` |
| `.vcg-close-btn:hover` (line 48) | `background: rgba(255,255,255,0.05); color: #f1f5f9` | White-on-white | Override |
| `.vcg-bulk-btn` (line 70) | `color: #94a3b8` | Hardcoded | `var(--text-secondary)` |
| `.vcg-bulk-btn:hover` (line 80) | `color: #818cf8` | Hardcoded accent | `var(--accent)` |
| `.vcg-bulk-btn--reset` (line 85) | `color: #64748b` | Hardcoded | `var(--text-muted)` |
| `.vcg-bulk-btn--reset:hover` (line 89) | `color: #fca5a5` | Pastel red for dark bg | `var(--danger)` for light |
| `.vcg-list` (line 98) | `scrollbar-color: rgba(255,255,255,0.1)` | White-on-white | Override with `rgba(0,0,0,0.15)` |
| `.vcg-item .sg-label` (line 118) | `color: #cbd5e1` | Hardcoded light gray | `var(--text-primary)` |

---

## Section E: Hardcoded Colors to Replace with Tokens

Every instance below uses a literal hex/rgba value where a CSS variable should be used instead. These should be fixed regardless of light/dark mode.

### E1. `nucleo-global/Feedback/tooltip-global/src/tooltip.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 59 | `background: #0f172a` | `var(--bg-body)` or `var(--bg-base)` |
| 60 | `border: 1px solid rgba(129, 140, 248, 0.22)` | `var(--border-accent)` |
| 63 | `box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6)` | `var(--shadow-lg)` |
| 84 | `color: #f1f5f9` | `var(--text-primary)` |
| 92 | `color: #94a3b8` | `var(--text-secondary)` |

### E2. `nucleo-global/Login/login-global/src/login-global.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 9 | `background: rgba(30, 41, 59, 0.6)` | `rgba(var(--bg-base-rgb), 0.6)` or dedicated token |
| 24 | `color: #f1f5f9` | `var(--text-primary)` |
| 30 | `color: #94a3b8` | `var(--text-secondary)` |
| 39 | `color: #475569` | `var(--text-muted)` |
| 43 | `color: #818cf8` | `var(--accent)` |
| 80 | `color: #f1f5f9 !important` | `var(--text-primary) !important` |
| 90 | `border-color: #6366f1 !important` | `var(--accent) !important` |
| 97 | `color: #94a3b8 !important` | `var(--text-secondary) !important` |
| 114 | `background: #7c3aed !important` | Clerk badge; may need to stay hardcoded |
| 137 | `color: #94a3b8` | `var(--text-secondary)` |
| 142 | `color: #475569` | `var(--text-muted)` |
| 146 | `color: #818cf8` | `var(--accent)` |
| 152 | `color: #a5b4fc` | `var(--accent-hover)` or dedicated light accent |
| 169 | `color: #6366f1` | `var(--accent)` |
| 177 | `color: #818cf8` | `var(--accent)` |
| 199 | `color: #ffffff` | `var(--text-primary)` |
| 205 | `color: #94a3b8` | `var(--text-secondary)` |
| 226 | `color: #94a3b8` | `var(--text-secondary)` |
| 241 | `color: #64748b` | `var(--text-muted)` |
| 248 | `background: rgba(15, 23, 42, 0.6)` | Dedicated input bg token |
| 251 | `color: #f1f5f9` | `var(--text-primary)` |
| 258 | `border-color: #6366f1` | `var(--accent)` |
| 259 | `background: rgba(15, 23, 42, 0.8)` | Dedicated token |
| 265 | `color: #818cf8` | `var(--accent)` |
| 271 | `background: #6366f1` | `var(--accent)` |
| 288 | `background: #4f46e5` | `var(--accent-hover)` |
| 305 | `color: #fca5a5` | `var(--danger)` or dedicated danger-light |
| 313 | `color: #94a3b8` | `var(--text-secondary)` |
| 324 | `color: #f1f5f9` | `var(--text-primary)` |
| 337 | `color: #4ade80` | `var(--success)` |
| 344 | `color: #f1f5f9` | `var(--text-primary)` |

### E3. `nucleo-global/Campos/switch-global/src/switch.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 40 | `background: #818cf8` | `var(--accent)` |
| 41 | `box-shadow: 0 0 10px rgba(129, 140, 248, 0.3)` | Dedicated token or inline with accent |
| 62 | `box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.5)` | `var(--focus-ring)` |

### E4. `nucleo-global/Layout/usuario-global/src/usuario-global.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 12 | `background: rgba(15, 23, 42, 0.82) !important` | Dedicated glassmorphism token |
| 121 | `color: #0f172a` | Could use a `--text-on-accent` token |
| 222-229 | `color: #22c55e`, `rgba(34,197,94,*)`, `color: #818cf8`, `rgba(129,140,248,*)` | `var(--success)`, `var(--success-soft)`, `var(--accent)`, `var(--accent-dim)` |

### E5. `nucleo-global/Tabelas/tabela-global/src/tabela.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 269 | `background: #1e293b` | `var(--bg-base)` |
| 636 | `background: rgba(15, 23, 42, 0.35)` | Dedicated child-row token |

### E6. `nucleo-global/Tabelas/tabela-global/src/componentes/visibilidade.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 33 | `color: #64748b` | `var(--text-muted)` |
| 38 | `color: #64748b` | `var(--text-muted)` |
| 49 | `color: #f1f5f9` | `var(--text-primary)` |
| 70 | `color: #94a3b8` | `var(--text-secondary)` |
| 80 | `color: #818cf8` | `var(--accent)` |
| 85 | `color: #64748b` | `var(--text-muted)` |
| 89 | `color: #fca5a5` | `var(--danger)` |
| 118 | `color: #cbd5e1` | `var(--text-primary)` |

### E7. `nucleo-global/Botoes/botao-global/src/botao.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 157 | `color: #fca5a5` | Need a `--danger-text` or `--danger-light` token for dark bg |
| 164 | `color: #fecaca` | Same |

### E8. `servicos-global/shell/shell.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 129 | `color: #0f172a` | `--text-on-accent` token |
| 222 | `rgba(129, 140, 248, 0.08)` | `var(--accent-dim)` |
| 375 | `color: #0f172a` | `--text-on-accent` token |
| 510 | `background: rgba(15, 23, 42, 0.85)` | Glassmorphism token |
| 556 | `background: #3b82f6 !important` | Could be `var(--info)` |
| 557 | `color: #ffffff !important` | Keep (always white on blue badge) |
| 563 | `box-shadow: 0 0 0 2px #0f172a !important` | `0 0 0 2px var(--bg-body) !important` |

### E9. `servicos-global/configurador/src/pages/hub-store.css`
| Line | Value | Replace With |
|------|-------|-------------|
| 78 | `rgba(15, 23, 42, 0.8)` | Gradient should reference bg tokens |
| 170-171 | `rgba(79, 70, 229, 0.1)`, `rgba(79, 70, 229, 0.2)` | `var(--accent-dim)`, `var(--accent-soft)` |
| 377 | `color: #fff` | `var(--text-primary)` |
| 394 | `background: rgba(15, 23, 42, 0.85)` | Glassmorphism token |
| 430 | `color: #fff` | `var(--text-primary)` |
| 442 | `background: rgba(15, 23, 42, 0.4)` | Glassmorphism token |
| 473 | `background: rgba(255, 255, 255, 0.05)` | Subtle surface token |
| 586 | `color: #fff` | `var(--text-primary)` |
| 614 | `color: #fff` | `var(--text-primary)` |
| 621 | `color: #fff` | `var(--text-primary)` |
| 663 | `color: #fff` | `var(--text-primary)` |

---

## Summary: Priority Matrix

### P0 - Breaks light mode (unusable)
1. **tokens.css** - Add missing tokens to `body.light-theme` (Section B: B1-B13)
2. **login-global.css** - Entire component hardcoded dark (Section D5)
3. **tooltip.css** - Dark background hardcoded (Section D3) -- unless decision is to keep tooltips dark
4. **switch.css** - Track invisible (Section D4)
5. **select.css** - Dropdown dark glassmorphism (Section D2)
6. **usuario-global.css** - Dark glassmorphism badge (Section D6)
7. **shell.css** - `.ws-global-user` dark glassmorphism, `.ws-global-badge` dark ring (Section D1)
8. **pagina-global.css** - Wrong fallback color in light override (Section D7)

### P1 - Visually degraded (functional but ugly)
9. **hub-store.css** - Multiple glassmorphism elements, white-on-white text (Section D8)
10. **atividades.css** - Multiple `rgba(15,23,42,*)` and `rgba(255,255,255,*)` elements (Section D9)
11. **botao.css** - Danger button pastel text (Section D10)
12. **menu-lateral.css** - Dark gradient, white-on-white hover (Section D14)
13. **visibilidade.css** - Hardcoded colors, white-on-white hover (Section D16)

### P2 - Subtle issues (polish)
14. **card.css / card-premium.css** - Heavy shadows, token fallback verification (Section D11)
15. **stat-card.css** - Same as card.css (Section D12)
16. **tabela.css** - Hardcoded option bg, faint borders (Section D15)
17. **campo-geral.css** - Mostly OK, verify cascade (Section D13)
18. **Shell/Marketplace/Workspace token sync** (Section C)

---

## Appendix: Token Inconsistencies to Resolve

| Token | tokens.css (:root) | shell.css (:root) | marketplace tokens.css (:root) | design-system SKILL.md | Resolution |
|-------|--------------------|--------------------|-------------------------------|----------------------|------------|
| `--accent` | `#818cf8` (Violet 400) | `#6366f1` (Indigo 500) | `#6366f1` (Indigo 500) | `#6366f1` (Indigo 500) | **Pick one canonical value** |
| `--accent-hover` | `#6366f1` | `#4f46e5` | `#4f46e5` | `#4f46e5` | **Pick one canonical value** |
| `--bg-body` vs `--bg-body-dark` | `--bg-body` | `--bg-body-dark` | `--bg-body-dark` | `--bg-body-dark` | **Unify naming** |
| `--focus-ring` | `0 0 0 2px rgba(129,140,248,0.4)` | `0 0 0 2px #818cf8` (opaque) | `0 0 0 2px #818cf8` (opaque) | `0 0 0 2px rgba(99,102,241,0.4)` | **Pick one** |
| Accent soft naming | `--accent-dim`, `--accent-soft` | N/A | `--accent-10`, `--accent-20` | N/A | **Unify naming** |

---

## Next Steps

1. **Color Harmony phase** delivers actual `NEW_VALUE` colors for all tokens in Sections A and B
2. **Resolve token inconsistencies** documented in the Appendix (single source of truth)
3. **Implement Section B** first (add missing tokens to canonical tokens.css)
4. **Implement Section C** (sync shell/marketplace/workspace)
5. **Implement Section D** in P0 > P1 > P2 priority order
6. **Implement Section E** (replace hardcoded colors with token references) -- can be done in parallel with D
7. **Visual regression testing** across all components in both themes
