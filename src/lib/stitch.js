/* Shared Stitch Design Tokens — FoodRevolut Delivery Ecosystem */

export const T = {
  displayLg:   { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:48, fontWeight:800, lineHeight:1.1, letterSpacing:'-0.02em' },
  headlineMd:  { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:24, fontWeight:700, lineHeight:1.3 },
  headlineSm:  { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:18, fontWeight:600, lineHeight:1.4 },
  titleLg:     { fontFamily:'Plus Jakarta Sans, sans-serif', fontSize:22, fontWeight:600, lineHeight:1.27 },
  titleMd:     { fontFamily:'Inter, sans-serif', fontSize:16, fontWeight:500, lineHeight:1.5, letterSpacing:'0.01em' },
  bodyLg:      { fontFamily:'Inter, sans-serif', fontSize:16, fontWeight:400, lineHeight:1.5 },
  bodySm:      { fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:400, lineHeight:1.43 },
  labelLg:     { fontFamily:'Inter, sans-serif', fontSize:14, fontWeight:500, lineHeight:1.43, letterSpacing:'0.01em' },
  labelMd:     { fontFamily:'Inter, sans-serif', fontSize:12, fontWeight:500, lineHeight:1.33, letterSpacing:'0.04em' },
  labelSm:     { fontFamily:'Inter, sans-serif', fontSize:11, fontWeight:500, lineHeight:1.45, letterSpacing:'0.04em' },
};

export const C = {
  /* Stitch Material 3 tokens */
  primary: '#4f378a',
  onPrimary: '#ffffff',
  primaryContainer: '#6750a4',
  primaryFixed: '#e9ddff',
  surface: '#fdf7ff',
  surfaceDim: '#ded8e0',
  surfaceContainer: '#f2ecf4',
  surfaceContainerLow: '#f8f2fa',
  surfaceContainerHigh: '#ece6ee',
  surfaceContainerLowest: '#ffffff',
  surfaceVariant: '#e6e0e9',
  onSurface: '#1d1b20',
  onSurfaceVariant: '#494551',
  outline: '#7a7582',
  outlineVariant: '#cbc4d2',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  inverseSurface: '#322f35',
  inverseOnSurface: '#f5eff7',

  /* Tenant accents */
  saffron: '#F26E21',
  saffronDark: '#d4570f',
  teal: '#0D9488',
  tealDark: '#0b7c72',
  navy: '#1E293B',
};

export const S = {
  unit: 4,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  gutter: 24,
  containerMobile: 16,
  containerDesktop: 32,
};

/* Reusable inline style builders */
export const card = {
  background: '#fff',
  border: '1px solid #cbc4d2',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

export const cardHover = {
  transform: 'translateY(-4px)',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
};

export const input = {
  width: '100%',
  height: 48,
  padding: '0 16px',
  background: '#f8f2fa',
  border: '1px solid #cbc4d2',
  borderRadius: 12,
  ...T.bodyLg,
  color: '#1d1b20',
  outline: 'none',
  transition: 'border 0.15s',
};

export const btnPrimary = {
  width: '100%',
  height: 52,
  border: 'none',
  borderRadius: 12,
  cursor: 'pointer',
  ...T.titleMd,
  fontWeight: 600,
  color: '#fff',
  background: '#4f378a',
  transition: 'all 0.15s',
};

export const btnSaffron = {
  ...btnPrimary,
  background: '#F26E21',
};

export const badge = (bg, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '4px 10px',
  borderRadius: 999,
  background: bg,
  color,
  ...T.labelMd,
  fontWeight: 600,
});

export const glassmorphic = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};
