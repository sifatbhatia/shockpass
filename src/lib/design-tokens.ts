/**
 * Design token mirror — normative source is DESIGN.md frontmatter + globals.css.
 * Use for programmatic access (charts, canvas, tests). Do not drift from DESIGN.md.
 */
export const colors = {
  bg: '#050505',
  panel: '#181818',
  panel2: '#232323',
  text: '#f7f5f5',
  muted: '#a3a1a8',
  border: 'rgba(255, 255, 255, 0.1)',
  /** primary accent (blush) — token name kept as `acid` for class compatibility */
  acid: '#f8d6f7',
  acidDim: '#f0bdee',
  hot: '#f59ac0',
  electric: '#ecdffb',
  success: '#8fd9bd',
  danger: '#ef6f6f',
} as const

export const radius = {
  drop: '0.75rem',
  pass: '1.25rem',
} as const

export const zIndex = {
  nav: 40,
  dropdown: 50,
  modal: 60,
  toast: 70,
} as const
