// Colors - Identical to web dashboard
export const Colors = {
  // Primary gradient colors
  primary: '#0A0E27',
  secondary: '#1a1f3a',

  // Accent colors
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Brand Colors (Allync Palette)
  coal: '#2B2C2C',           // Ana Zemin (Kömür) - Dark mode background
  titanium: '#F8F9FA',       // Açık Zemin (Titanyum Beyazı) - Light mode background
  deepBlue: '#0D6EFD',       // Ana Vurgu (Derin Mavi) - Primary CTA
  cyberGray: '#ADB5BD',      // İkincil Vurgu (Siber Gri) - Secondary text

  // UI colors
  background: '#2B2C2C',     // Kömür
  card: 'rgba(43, 44, 44, 0.9)',
  border: 'rgba(173, 181, 189, 0.2)',  // Siber Gri ile border

  text: {
    primary: '#F8F9FA',      // Titanyum Beyazı
    secondary: '#ADB5BD',    // Siber Gri
    tertiary: '#6b7280',
    muted: '#6b7280',
  },

  // Status colors
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f97316',
  info: '#0D6EFD',           // Derin Mavi
} as const;

// Gradient definitions (for LinearGradient)
export const Gradients = {
  primary: ['#2B2C2C', '#1a1b1b'],              // Kömür gradient
  deepBlue: ['#0D6EFD', '#0a58ca'],             // Derin Mavi gradient (Ana CTA)
  blue: ['#0D6EFD', '#0a58ca'],                 // Alias for deepBlue
  cyan: ['#06b6d4', '#0891b2'],
  green: ['#22c55e', '#10b981'],
  red: ['#ef4444', '#f97316'],
  orange: ['#f97316', '#ea580c'],
  purple: ['#a855f7', '#ec4899'],
  card: ['rgba(43, 44, 44, 0.9)', 'rgba(43, 44, 44, 0.7)'],
  titanium: ['#F8F9FA', '#e9ecef'],            // Titanyum Beyazı gradient
} as const;
