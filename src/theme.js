export const getDesignTokens = (mode = 'light', compact = false) => ({
  palette: {
    mode,
    primary: {
      main: '#5b21b6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0ea5e9',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#111827' : '#f8fafc',
      secondary: mode === 'light' ? '#6b7280' : '#d1d5db',
    },
    divider: mode === 'light' ? '#e5e7eb' : '#2c2c2c',
  },
  shape: {
    borderRadius: compact ? 8 : 14,
  },
  spacing: compact ? 6 : 8,
  typography: {
    fontFamily: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
    h1: { fontSize: '2rem', fontWeight: 700 },
    h2: { fontSize: '1.75rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: compact ? 10 : 16,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: compact ? 10 : 16,
          boxShadow: mode === 'light' ? '0 10px 30px rgba(15, 23, 42, 0.04)' : '0 10px 30px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: compact ? '10px 12px' : '14px 16px',
        },
      },
    },
  },
})
