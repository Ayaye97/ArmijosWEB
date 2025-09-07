// Tailwind config (extraído del HTML)
// Nota: Este archivo funciona cuando se usa CDN de Tailwind.
// Debe cargarse después del script CDN y antes de cualquier uso de clases.

/* global tailwind */
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        container: { center: true, padding: '1rem' },
        colors: {
          background: '#ffffff',
          foreground: '#252525',
          card: '#ffffff',
          'card-foreground': '#252525',
          primary: '#f59e0b',
          'primary-foreground': '#030213',
          secondary: '#f8fafc',
          'secondary-foreground': '#030213',
          muted: '#eef2f6',
          'muted-foreground': '#717182',
          accent: '#f1f5f9',
          'accent-foreground': '#030213',
          destructive: '#d4183d',
          'destructive-foreground': '#ffffff',
          border: 'rgba(0, 0, 0, 0.1)',
          input: 'transparent',
          ring: '#b4b4b4',
        },
        fontFamily: {
          sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
        },
      },
    },
  };
}
