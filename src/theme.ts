/**
 * Design tokens do protótipo aprovado (tem-brasileiro-app.jsx).
 * Toda cor, raio, sombra e fonte do app sai daqui — nada de valores soltos nas telas.
 */

export const colors = {
  /** verde-mata — cor primária da marca */
  green: '#14634B',
  /** verde-escuro — fundos profundos e degradês do cabeçalho */
  greenDark: '#0C3D2E',
  /** verde-claro — início do degradê radial do cabeçalho */
  greenLight: '#1E7F62',
  /** texto/ícones sobre o verde do cabeçalho */
  onGreen: '#EAF5F0',
  /** tinta — texto principal */
  ink: '#101B16',
  /** amarelo — destaque da marca e selo Verificado */
  yellow: '#FFC942',
  /** cinza — texto secundário */
  gray: '#5E6B64',
  /** linha — bordas e divisores */
  line: '#E4E9E6',
  /** fundo — plano de fundo geral do app */
  bg: '#F2F4F0',
  /** verde do botão de WhatsApp */
  whatsapp: '#1FAF54',
  white: '#FFFFFF',
} as const;

/** Superfícies de vidro (glassmorphism): rgba branco + blur + borda clara */
export const glass = {
  surface: 'rgba(255,255,255,0.62)',
  surfaceStrong: 'rgba(255,255,255,0.88)',
  navBar: 'rgba(255,255,255,0.82)',
  /** vidro sobre o degradê verde do cabeçalho */
  onGreen: 'rgba(255,255,255,0.14)',
  onGreenBorder: 'rgba(255,255,255,0.28)',
  border: 'rgba(255,255,255,0.65)',
  blur: 28,
} as const;

export const radius = {
  chip: 99,
  card: 18,
  cardLg: 22,
  header: 28,
  input: 16,
} as const;

export const fonts = {
  /** títulos e display */
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  /** corpo */
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const shadows = {
  soft: {
    shadowColor: colors.greenDark,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  card: {
    shadowColor: colors.greenDark,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  floating: {
    shadowColor: colors.greenDark,
    shadowOpacity: 0.18,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;
